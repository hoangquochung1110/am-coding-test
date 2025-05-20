import { BaseTransformer } from '../../base/index.js';

class NewsApiTransformer extends BaseTransformer {
    transform(data) {
        return {
            status: data.status,
            total_results: data.totalResults,
            articles: data.articles
                .filter(article => article.content !== null) // Filter out articles with null content
                .map(article => ({
                    title: article.title,
                    description: article.description,
                    content: article.content,
                    url: article.url,
                    imageUrl: article.imageUrl,
                    publishedAt: article.publishedAt,
                    sourceName: article.sourceName,
                    author: article.author || ''
                }))
        };
    }

    validate(data) {
        return data && 
            Array.isArray(data.articles) && 
            typeof data.totalResults === 'number' &&
            data.status === 'ok';
    }
}

export default NewsApiTransformer;