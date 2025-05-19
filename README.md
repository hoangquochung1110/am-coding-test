# am-coding-test

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

Chi tiết về triển khai dự án sẽ được bổ sung sau.
