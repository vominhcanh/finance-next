# Yêu Cầu Backend: Dashboard Analytics API

Tài liệu này mô tả chi tiết các thay đổi cần thiết cho API `GET /v1/analytics/monthly-overview` để hỗ trợ hiển thị thống kê động và xu hướng trên Dashboard.

## 1. Tổng Quan
Hiện tại API chỉ trả về `totalIncome`, `totalExpense`, `balance`.
Cần nâng cấp để trả về **4 chỉ số chính** tương ứng với 4 thẻ trên giao diện, kèm theo **% tăng trưởng (trend)** so với tháng trước.
Đồng thời trả về tổng số lượng ví để Frontend không cần gọi API `wallets` riêng.

## 2. Chi Tiết API

### Endpoint
`GET /v1/analytics/monthly-overview`

### Request Parameters
*   `month` (Optional): `YYYY-MM`. Nếu không truyền, mặc định là tháng hiện tại.

### Response Structure (New JSON)

```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalWalletBalance": 125000000,  // Mapping: Card "Tổng Thu Nhập"
      "totalExpense": 5000000,          // Mapping: Card "Tổng Chi Tiêu"
      "netBalance": 2000000,            // Mapping: Card "Số Dư Hiện Tại"
      "totalWallets": 4                 // Mapping: Card "Tổng Số Ví"
    },
    "trends": {
      "totalWalletBalance": 4.8,  // % thay đổi so với tháng trước
      "totalExpense": 2.5,        // % thay đổi so với tháng trước
      "netBalance": -1.8,         // % thay đổi so với tháng trước
      "totalWallets": 0           // % thay đổi so với tháng trước
    }
  }
}
```

## 3. Định Nghĩa Logic Dữ Liệu

### A. Các Trường Số Liệu (Stats)

1.  **totalWalletBalance** (Hiển thị tại card "Tổng Thu Nhập"):
    *   **Logic**: Tổng số dư (`balance`) của **tất cả các ví** (`wallets`) đang hoạt động.
    *   **Lý do**: User định nghĩa "Tổng Thu Nhập" là tổng tiền đang có trong các ví.

2.  **totalExpense** (Hiển thị tại card "Tổng Chi Tiêu"):
    *   **Logic**: Tổng số tiền (`amount`) của các giao dịch chi tiêu (`type='EXPENSE'`) trong **tháng hiện tại**.

3.  **netBalance** (Hiển thị tại card "Số Dư Hiện Tại"):
    *   **Logic**: `(Tổng Tiền Vào trong tháng) - (Tổng Tiền Ra trong tháng)`.
    *   **Ý nghĩa**: Dòng tiền thuần trong tháng (Cash Flow).

4.  **totalWallets** (Hiển thị tại card "Tổng Số Ví"):
    *   **Logic**: Đếm số lượng (`count`) các ví trong collection `wallets`.

### B. Logic Xu Hướng (Trends)
*   **Format**: Số thực (float), ví dụ `4.8`, `-1.5`.
*   **Công thức**: `((Giá trị tháng này - Giá trị tháng trước) / |Giá trị tháng trước|) * 100`
*   **Xử lý Total Wallet Balance Trend**: So sánh `Tổng số dư hiện tại` với `Tổng số dư tại thời điểm cuối tháng trước`. (Nếu không có snapshot lịch sử, có thể tạm thời trả về `0` hoặc tính toán dựa trên dòng tiền).
