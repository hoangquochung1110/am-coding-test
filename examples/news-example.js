import { createNewsService } from '../services/news/index.js';
import { createNewsRepository, RepositoryType } from '../repositories/news/index.js';
import { News } from '../models/news.js';
import 'dotenv/config';

// Initialize news service and repository
const newsApiService = createNewsService(process.env.NEWSAPI_API_KEY)

const newsRepository = await createNewsRepository({
    type: RepositoryType.SEQUELIZE,
    config: {
        model: News
    }
});

// Example of using the news service and repository
const demonstrateNewsService = async () => {
    try {
        // Get top headlines
        console.log('\nFetching top headlines:\n');
        const topHeadlines = await newsApiService.getTopHeadlines({ 
            country: 'us',
            category: 'technology'
        });
        
        // Save headlines to database
        for (const article of topHeadlines.articles) {
            try {
                // Prepare article data
                const articleData = {
                    title: article.title,
                    description: article.description || '',
                    content: article.content || '',
                    url: article.url,
                    imageUrl: article.imageUrl || '', 
                    publishedAt: article.publishedAt,
                    sourceName: article.sourceName,
                    author: article.author || '',
                    provider: 'newsapi'
                };
                
                console.log(`\n📰 Processing: ${articleData.title}`);
                
                try {
                    const savedArticle = await newsRepository.create(articleData);
                    console.log(`✅ Saved: ${savedArticle.title}`);
                } catch (dbError) {
                    // Check if this is a unique constraint violation (duplicate URL)
                    const isDuplicateError = dbError.name === 'SequelizeUniqueConstraintError' && 
                                           dbError.errors?.some(e => e.validatorKey === 'not_unique' && e.path === 'url');
                    
                    if (isDuplicateError) {
                        console.log(`⏩ Skipped (duplicate): ${articleData.url}`);
                        return; // Skip to next article
                    }
                    
                    // For all other errors, log them
                    console.error("\n❌ Database Operation Failed:");
                    console.error("Error Type:", dbError.name);
                    console.error("Error Message:", dbError.message);
                    
                    // Log complete error object for debugging
                    console.error("\n📋 Complete Error Object:", JSON.stringify({
                        name: dbError.name,
                        message: dbError.message,
                        stack: dbError.stack?.split('\n'),
                        ...(dbError.originalError && {
                            originalError: {
                                name: dbError.originalError.name,
                                message: dbError.originalError.message,
                                code: dbError.originalError.code,
                                constraint: dbError.originalError.constraint,
                                table: dbError.originalError.table
                            }
                        }),
                        ...(dbError.errors && {
                            validationErrors: dbError.errors.map(e => ({
                                field: e.path,
                                message: e.message,
                                type: e.type,
                                value: e.value,
                                validatorKey: e.validatorKey,
                                validatorName: e.validatorName
                            }))
                        })
                    }, null, 2));
                    
                    // Log database state information for non-duplicate errors
                    console.log("\n🔍 Database State:");
                    try {
                        const existing = await News.findOne({ where: { url: articleData.url } });
                        if (existing) {
                            console.log(`- Article with this URL already exists (ID: ${existing.id})`);
                            console.log(`- Existing article created at: ${existing.createdAt}`);
                        } else {
                            console.log("- No existing article found with this URL");
                        }
                    } catch (lookupError) {
                        console.error("- Could not check for existing article:", lookupError.message);
                    }
                    
                    // Log article data that caused the error
                    console.log("\n📦 Article Data That Caused the Error:", JSON.stringify({
                        ...articleData,
                        content: articleData.content ? `[${articleData.content.length} characters]` : 'Empty'
                    }, null, 2));
                    
                    // Log complete original article
                    console.log("\n📰 Original Article Data:", JSON.stringify(article, null, 2));
                }
            } catch (error) {
                console.error("\n❌ Unexpected error processing article:", error);
                console.error("Error Stack:", error.stack);
                console.error("Article being processed:", JSON.stringify(article, null, 2));
            }
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

// Run the example
demonstrateNewsService();