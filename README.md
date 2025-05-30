# am-coding-test

⚠️ **Lưu ý:**

Do triển khai application trên Render sử dụng free plan, server đôi khi không sẵn sàng, nên sẽ phản hồi chậm ở lần truy cập đầu tiên

## Sơ đồ hệ thống

```
                                                                                                                   ┌────────────┐     
                                                                                                                   │            │     
                                                                                                                   │ Data Store │     
          ┌───────────────────┐                     ┌──────────────────────────────────┐                           │ (Postgres) │     
          │                   │                     │                                  │                           │            │     
          │                   │                     │        APPLICATION SERVER        │           read            │  Tables:   │     
          │      FRONTEND     ├─────────────────────▶            (Express)             ◀───────────────────────────▶   - news   │     
          │                   │                     │                                  │                           │ - weather  │     
          │                   │                     │                                  │                           │            │     
          └───────────────────┘                     └──────────────────────────────────┘                           │            │     
                                                                                                                   └──────▲─────┘     
                                                                                                                          │           
┌───────────────────────────────────────────┐                                                                             │           
│                                           │                                                                             │           
│                                           │                                                                             │           
│           ┌──────────────────┐            │                                                                             │           
│           │                  │            │                                                                             │           
│           │  OpenWeatherMap  │            │        ┌───────────┐         ┌───────────┐                                  │           
│           │                  │            │        │           │         │           │                                  │           
│           │                  │            │        │           │         │           │                                  │           
│           └──────────────────┘            │        │           │         │           │              write               │           
│                                           ├────────▶  Worker   │   ...   │  Worker   ├──────────────────────────────────┘           
│           ┌──────────────────┐            │        │           │         │           │                                              
│           │                  │            │        │           │         │           │                                              
│           │   AccuWeather    │            │        │           │         │           │                                              
│           │                  │            │        └─────▲─────┘         └─────▲─────┘                                              
│           │                  │            │              │                     │                                                    
│           └──────────────────┘            │              │                     │                                                    
│                                           │              │                     │                                                    
│           ┌──────────────────┐            │        ┌─────┴─────────────────────┴──────┐                                             
│           │                  │            │        │                                  │                 Admins/Operators can:       
│           │     NewsAPI      │            │        │                                  │                 - schedule jobs (to fetch   
│           │                  │            │        │   Admin Dashboard (Cloudflare) ◀─┼───────────────  data)                       
│           │                  │            │        │                                  │                 - configure parameters (city
│           └──────────────────┘            │        │                                  │                 for weather conditions,     
│                                           │        └──────────────────────────────────┘                 topics/subjects for news)   
│                                           │                                                             - monitors jobs             
└───────────────────────────────────────────┘                                                                                         
                                                                                                                                      
                                                                                                                                      
```

## Yêu cầu đề bài:

✅ Lấy data từ ít nhất hai nguồn: OpenWeatherMap và AccuWeather và NewsAPI

✅ Chuẩn hoá và lưu data vào database PostgreSQL

✅ Endpoint để trả về kết quả kết hơp từ nhiều bảng: 
   ```
   curl https://am-coding-test.onrender.com/api/aggregated-data
   ```

✅ [Frontend dashboard](https://github.com/hoangquochung1110/am-coding-test-front). Live: https://am-coding-test-front.pages.dev/

✅ Rate limiting:
   - Server sử dụng `express-rate-limit` để limit số lượng request (theo IP) trong một thời gian nhất định. Dữ liệu lưu trữ in-memory do đây là POC có server đơn. Trong môi trường production, ta có thể sử dụng Redis để lưu trữ dữ liệu trong môi trường đa máy chủ để bảo đảm tính sẵn sàng cao.
   - Frontend kết hợp xử lí rate limiting với việc lưu trữ request history trong localStorage để làm dịu trải nghiệm người dùng.

## Thông tin dự án

Dự án sử dụng Express.js 4.21.0 làm web framework và Sequelize với PostgreSQL cho lưu trữ dữ liệu.

## Cài đặt

Để thiết lập dự án, làm theo các bước sau:

1. Đảm bảo bạn đã cài đặt `nvm` (Node Version Manager). Nếu chưa, bạn có thể cài đặt bằng cách chạy:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. Cài đặt Node.js 20 LTS bằng `nvm`:

   ```bash
   nvm install 20
   ```

3. Sử dụng Node.js 20:

   ```bash
   nvm use 20
   ```

4. Cài đặt các package cần thiết:

   ```bash
   npm install
   ```

5. Thiết lập cơ sở dữ liệu (xem phần dưới)

6. Khởi động dự án:

   ```bash
   npm start
   ```

## Thiết lập cơ sở dữ liệu

Dự án này có thể sử dụng PostgreSQL thông qua hai cách: cục bộ với Docker Compose hoặc dịch vụ từ xa.

### Tùy chọn 1: PostgreSQL cục bộ với Docker Compose

1. Đảm bảo bạn đã cài đặt Docker và Docker Compose.

2. Dự án đã cung cấp sẵn file `docker-compose.yml` với cấu hình PostgreSQL. File này định nghĩa:
   
   - Container PostgreSQL version 14
   - Thông tin đăng nhập và tên database
   - Volume cho dữ liệu database
   - Mount thư mục `db/init` vào đường dẫn đặc biệt `/docker-entrypoint-initdb.d` trong container

3. Các script khởi tạo (initialization scripts) đã được chuẩn bị sẵn trong thư mục `db/init`. 

4. Khởi động container PostgreSQL:

   ```bash
   docker-compose up -d
   ```

Lưu ý quan trọng về volume:

Các script khởi tạo chỉ tự động thực thi khi container được tạo lần đầu tiên và volume trống.
Nếu volume postgres_data đã tồn tại (từ lần chạy trước), các script sẽ KHÔNG được thực thi khi khởi động lại container.

### Tùy chọn 2: Dịch vụ PostgreSQL từ xa (serverless)

Bạn có thể sử dụng bất kỳ dịch vụ PostgreSQL từ xa nào (như Neon, Amazon RDS, Google Cloud SQL, Azure Database for PostgreSQL, v.v.).

1. Đăng ký và tạo cơ sở dữ liệu từ nhà cung cấp dịch vụ.

2. Lấy chuỗi kết nối (connection string) từ nhà cung cấp.

3. Tạo file `.env` trong thư mục gốc của dự án:

   ```
   # Database
   NODE_ENV=production
   DB_CONNECTION_STRING=postgres://username:password@host:port/database
   ```

4. Chạy các script khởi tạo:

   ```bash
   # Sử dụng psql với chuỗi kết nối
   psql "postgres://username:password@host:port/database" -f database/init/schema.sql
   psql "postgres://username:password@host:port/database" -f database/init/seed.sql
   
   # Hoặc chạy tất cả các script cùng lúc
   cat database/init/*.sql | psql "postgres://username:password@host:port/database"
   ```

## Triển khai

### Triển khai Cloudflare Worker

Dự án này sử dụng Cloudflare Workers để tự động thu thập dữ liệu thời tiết. Để triển khai Worker, làm theo các bước sau:

1. Đảm bảo bạn đã cài đặt Wrangler CLI:

   ```bash
   npm install -g wrangler
   ```

2. Đăng nhập vào tài khoản Cloudflare của bạn:

   ```bash
   wrangler login
   ```

3. Cấu hình các bí mật (secrets) cần thiết:

   ```bash
   # Thêm API key cho OpenWeatherMap
   wrangler secret put OPENWEATHERMAP_API_KEY

   # Thêm thông tin đăng nhập cơ sở dữ liệu
   wrangler secret put DB_USER
   wrangler secret put DB_PASSWORD
   wrangler secret put DB_HOST
   wrangler secret put DB_NAME
   ```

4. Xây dựng và triển khai Worker:

   ```bash
   npm run worker:build
   npm run worker:deploy
   ```

## Triển khai Application lên Render

Render cung cấp một nền tảng đơn giản để triển khai ứng dụng Node.js với PostgreSQL. Dưới đây là cách triển khai ứng dụng này lên Render:

### Ưu điểm khi triển khai trên Render:

1. **Dễ dàng triển khai**
   - Kết nối trực tiếp với GitHub/GitLab để tự động triển khai khi có thay đổi
   - Hỗ trợ nhiều ngôn ngữ và framework phổ biến, trong đó có Nodejs và Express
   - Giao diện quản lý trực quan, dễ sử dụng

2. **Cấu hình đơn giản**
   - Tự động phát hiện cấu hình dự án (Node.js, package.json, v.v.)
   - Hỗ trợ biến môi trường dễ dàng
   - Tích hợp sẵn Let's Encrypt SSL

3. **Chi phí hợp lý**
   - **Miễn phí** cho Web Service với:
     - 512 MB RAM
     - CPU chia sẻ
     - Đổi lại, **dịch vụ đôi lúc không sẵn sàng, thiếu ổn định**

### Các bước triển khai:

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/)
2. Tạo mới một "Web Service"
3. Kết nối với repository GitHub/GitLab của bạn
4. Cấu hình thông số:
   ```
   Build Command: npm install
   Start Command: npm start
   ```
5. Thêm các biến môi trường cần thiết
6. Nhấn "Create Web Service"

Sau khi triển khai, Render sẽ cung cấp cho bạn một URL công khai để truy cập ứng dụng.

### Bí mật (Secrets) cần thiết cho Wrangler

Worker cần các bí mật sau để hoạt động:

- `OPENWEATHERMAP_API_KEY`: Khóa API cho dịch vụ OpenWeatherMap
- `DB_USER`: Tên người dùng cơ sở dữ liệu
- `DB_PASSWORD`: Mật khẩu cơ sở dữ liệu
- `DB_HOST`: Tên miền/URL cơ sở dữ liệu
- `DB_NAME`: Tên cơ sở dữ liệu

### Phát triển cục bộ với Wrangler

Để phát triển Worker cục bộ, tạo tệp `.dev.vars` trong thư mục gốc với nội dung:

```
OPENWEATHERMAP_API_KEY=your_api_key
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_NAME=your_db_name
```

Sau đó, chạy:

```bash
npm run worker:dev
```

Kiểm tra Worker bằng cách sử dụng:

```bash
curl http://localhost:8787/trigger-fetch
```