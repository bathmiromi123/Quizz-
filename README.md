# Quiz Library

Website tĩnh dùng GitHub Pages. Mỗi môn có nhiều bộ đề theo mã SP26, SU26, FA26... và sắp xếp giảm dần theo năm, trong cùng năm FA > SU > SP.
ta/catalog.json` thủ công.

## Thêm bộ đề
- Ví dụ môn `NWC204`, kỳ `FA27`: upload file JSON thành `data/nwc204/FA27.json`. Tên file phải theo `SPyy`, `SUyy`, `FAyy`.
- Giữ schema của file mẫu `data/nwc204/SP26.json` (`title`, `questions`, `q`, `options`, `answer`, `explain`, `img`...). Không cần sửa HTML.
- GitHub Actions tự tái tạo `data/catalog.json` khi commit trên branch main. Có thể mất một chút thời gian trước khi bộ đề xuất hiện sau khi GitHub Pages triển khai.
- Nếu không muốn dùng GitHub Actions: chạy `python scripts/build_catalog.py`, commit file `data/catalog.json` cùng JSON mới.
- Thêm môn mới bằng cách tạo thư mục `data/tenmon` (chữ thường, chỉ a-z, 0-9, `_`, `-`) và thêm file JSON.

## Thêm ảnh câu hỏi
Upload ảnh vào `data/nwc204/images/SP26/q15.png`. Trong câu hỏi ghi:

```json
"img": "data/nwc204/images/SP26/q15.png"
```

Đường dẫn này được tính từ thư mục gốc website, không phải tương đối từ file JSON. Có thể dùng URL https:// thay thế. Các ảnh chỉ tải khi câu tương ứng được hiển thị.

## Tiến độ
- Tự lưu vị trí câu, đáp án, trạng thái kiểm tra, thứ tự trộn, thời gian còn lại theo mốc thực và kết quả bằng `localStorage`.
- Khi mở lại đề, bấm **Tiếp tục bài đang làm**. Bấm **Bắt đầu làm bài** để làm lại và thay tiến độ cũ.
- Dữ liệu lưu tại cùng trình duyệt/trang web; không đồng bộ giữa thiết bị hoặc qua chế độ ẩn danh. Xóa dữ liệu website sẽ xóa tiến độ.
- Không thay đổi nội dung JSON của một kỳ giữa lúc đang làm; tiến độ cũ có thể không tương thích với đề đã chỉnh sửa.

## Chạy thử trên máy
Mở terminal tại thư mục này:

```bash
python -m http.server 8000
```

Sau đó vào `http://localhost:8000`. Tránh mở trực tiếp `index.html` bằng `file://` vì trình duyệt có thể chặn `fetch()`.
