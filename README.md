# Quiz Library

🌐 **Website:** https://bathmiromi123.github.io/Quizz-/

Website trắc nghiệm tĩnh chạy trên **GitHub Pages**. Mỗi môn học có nhiều bộ đề theo mã `SP26`, `SU26`, `FA26`... Danh sách được sắp xếp từ **năm mới đến năm cũ**; trong cùng năm: **FA > SU > SP**.

**Repository:** https://github.com/bathmiromi123/Quizz-

## 1. Quy trình tạo đề bằng 2 AI

### Bước 1 — AI thứ nhất (ví dụ DeepSeek): trích xuất đề, đề xuất đáp án

Gửi ảnh chụp, PDF hoặc TXT chứa đề cho AI thứ nhất và yêu cầu:

- Trích xuất **nguyên văn tất cả câu hỏi** và lựa chọn A/B/C/D...; giữ đúng thứ tự.
- Nếu đề **có đáp án**, ghi đáp án từ nguồn rồi kiểm tra lại; nếu **không có đáp án**, tự giải và giải thích ngắn gọn.
- Nhận diện câu **có nhiều đáp án đúng**.
- Đánh dấu câu khó đọc, thiếu dữ kiện, có bảng, hình hoặc sơ đồ; **không đoán bừa**.
- Đếm tổng số câu, đối chiếu với đề gốc; **không tự ý xóa câu**.
- Xuất file `.txt` hoặc `.md` gồm **câu hỏi + lựa chọn + đáp án gốc (nếu có) + đáp án AI đề xuất + giải thích**.

**Chưa tạo JSON ở bước này.**

### Bước 2 — AI thứ hai (ví dụ ChatGPT, Claude): kiểm tra chéo

Gửi file TXT/MD từ bước 1, kèm ảnh gốc khi cần, và yêu cầu:

- **Tự giải và kiểm tra độc lập từng câu**, không chỉ xem những câu AI trước nghi ngờ.
- Đối chiếu đáp án một lựa chọn và nhiều lựa chọn; chỉ rõ các câu sai, câu có phát biểu không chính xác.
- Với câu có hình nhưng không có ảnh gốc, ghi **chưa đủ dữ kiện**, không tự đoán.
- Trả kết quả theo **số câu gốc**: đáp án AI thứ nhất, đáp án kiểm tra, kết luận và giải thích ngắn.

### Bước 3 — Quay lại AI thứ nhất: tạo file đề JSON

Gửi lại kết quả cross-check và đề gốc, yêu cầu:

- Áp dụng các đáp án đã xác minh; nếu hai nguồn mâu thuẫn, **báo lại**, không âm thầm chọn một đáp án.
- Giữ nguyên nội dung, thứ tự câu và lựa chọn.
- Thêm trường `"explain"` **bằng tiếng Việt cho mọi câu** (giải thích *vì sao*, không chỉ dịch đáp án).
- Không bỏ câu thiếu hình hoặc chưa có đáp án mà không báo rõ; giải quyết trước khi xuất JSON hoàn chỉnh.
- Chỉ tách ảnh **cần thiết để giải câu hỏi** (topology, routing table, sơ đồ, hình minh họa); không cần cắt ảnh chỉ có chữ đã trích xuất đầy đủ.
- Xuất **file `.json` thật**, và ảnh đi kèm nếu có; không tạo HTML/CSS/JS mới.
- Kiểm tra số câu trong JSON, số câu gốc, JSON hợp lệ, chỉ số đáp án và đường dẫn ảnh.

## 2. Định dạng JSON của Quiz Library

Ví dụ **`data/nwc204/FA26.json`**:

```json
{
  "title": "NWC204 - FA26",
  "description": "Bộ đề ôn tập FA26",
  "timeLimitMinutes": 0,
  "mode": "instant",
  "shuffleQuestions": false,
  "shuffleOptions": false,
  "autoNext": true,
  "questions": [
    {
      "q": "Which protocol is used to send email?",
      "options": ["HTTP", "SMTP", "POP3", "IMAP"],
      "answer": 1,
      "explain": "SMTP dùng để gửi email. POP3 và IMAP thường dùng để nhận email."
    },
    {
      "q": "Which three application layer protocols use TCP? (Choose three.)",
      "options": ["SMTP", "FTP", "SNMP", "HTTP", "TFTP", "DHCP"],
      "answer": [0, 1, 3],
      "explain": "SMTP, FTP và HTTP sử dụng TCP trong ngữ cảnh câu hỏi này."
    }
  ]
}
```

Quy tắc:

- `"answer"` đánh số **từ 0**: A = `0`, B = `1`, C = `2`, D = `3`...; nhiều đáp án đúng dùng mảng như `[0, 2]`.
- Trong `"options"` chỉ ghi nội dung, **không thêm `A.`, `B.`**.
- Mỗi câu phải có `q`, `options`, `answer`, `explain`.
- Không viết chú thích `//` hay dấu phẩy thừa trong JSON.
- `timeLimitMinutes: 0` là không giới hạn thời gian trong dữ liệu. Phần cài đặt hiển thị còn phụ thuộc phiên bản website.

## 3. Ảnh trong đề

Ví dụ cấu trúc:

```text
data/
└── nwc204/
    ├── FA26.json
    └── images/
        └── FA26/
            ├── q15.png
            └── q27.png
```

Trong câu hỏi tương ứng, thêm:

```json
"img": "data/nwc204/images/FA26/q15.png"
```

**Đường dẫn phải đúng và đủ file ảnh**; không tự tạo lại sơ đồ thay ảnh gốc. Nếu câu hỏi cần hình để xác định đáp án mà chưa có hình, phải đánh dấu chờ xác minh.

## 4. Upload bộ đề lên GitHub

1. Đăng nhập tài khoản GitHub có quyền sửa repository: https://github.com/bathmiromi123/Quizz-
2. Mở `data/<mã-môn>/` (ví dụ `data/nwc204/`). Nếu là môn mới, tạo thư mục chữ thường, ví dụ `data/pro192/`.
3. Chọn **Add file → Upload files**, đưa file `FA26.json` vào đúng thư mục và các ảnh vào đường dẫn nêu trong JSON (nếu có).
4. Nhấn **Commit changes** trên nhánh `main`.
5. Mở **Actions**, xem workflow **Update quiz catalog** có dấu tích xanh không.
6. Khi GitHub Pages triển khai xong, vào https://bathmiromi123.github.io/Quizz-/ và mở thử đề: kiểm tra tên, số câu, đáp án, giải thích và hình ảnh.

**Đặt tên file:** Hiện phần sắp xếp tự động được thiết kế cho mã `SP26.json`, `SU26.json`, `FA26.json` (không có dấu cách). Nếu cần tách `RE` và `FE` thành hai đề của một kỳ, **cần cập nhật cơ chế đặt tên/sắp xếp và kiểm tra đường dẫn website trước**; không tự dùng tên `FA25 - FE.json` vì có thể bị từ chối khi mở đề.

### Tự động cập nhật danh mục

Workflow GitHub Actions tái tạo `data/catalog.json` từ các file đề trong `data/`. **Không cần sửa `catalog.json` bằng tay** nếu workflow hoạt động bình thường. Nếu workflow không chạy, kiểm tra tab Actions và quyền ghi trong **Settings → Actions → General → Workflow permissions**.

## 5. Làm chung với bạn

Chủ repository vào **Settings → Collaborators → Add people**, mời tài khoản GitHub của bạn. Bạn cần chấp nhận lời mời trước khi có quyền upload. Nên phân chia môn/đề để tránh cùng sửa một file và kiểm tra các thay đổi trước khi commit.
