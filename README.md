# phat-trien-phan-mem-phan-tan
Phát triển phần mềm phân tán
 

​



Giới thiệu công nghệ


Dự án này được chạy trên:
* Môi trường [Node.Js](https://nodejs.org/en/docs/) (Tài liệu: [document](https://nodejs.org/en/docs/))

![](https://img.icons8.com/windows/128/000000/node-js.png)
* Cơ sở dữ liệu sử dụng của [MongoDB](https://docs.mongodb.com/) (Tài liệu: [document](https://docs.mongodb.com/))

![](https://docs.mongodb.com/images/mongodb-logo.png)
* Sử dụng giao diện và dữ liệu bản đồ của [MapBox](https://www.mapbox.com/)(Tài liệu: [document](https://www.mapbox.com/))

![](https://assets.website-files.com/5d3ef00c73102c436bc83996/5d3ef00c73102c893bc83a28_logo-regular-p-500.png)

* Cài đặt và chạy bằng [Docker](https://docs.docker.com/)(Tài liệu: [document](https://docs.docker.com/))

![](https://cdn.thenewstack.io/media/2014/04/homepage-docker-logo.png)
* Truyền dữ liệu, thông tin trong thời gian thực với [Socket.io](https://socket.io/)

![](https://www.programwitherik.com/content/images/2017/01/socket-e1434850599985.png)
### Cài đặt môi trường, csdl
* Cài đặt mô trường Node.Js. Link tải [link](https://nodejs.org/dist/v12.13.1/node-v12.13.1-x64.msi)
* Cài đặt môi trường cơ sở dữ liệu MongoDB. Link tải [link](https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2012plus-4.2.1-signed.msi)
* Cài đặt giao diện để quan sát cơ sở dữ liệu Robo3T . Link tải [link](https://download-test.robomongo.org/windows/robo3t-1.3.1-windows-x86_64-7419c406.exe)
### Cài đặt các thư viện
yarn
### Khởi chạy chương trình
* Trong file pagckage.json, đoạn scrpt "build": "docker-compose up --build" để build Dockerfile.
