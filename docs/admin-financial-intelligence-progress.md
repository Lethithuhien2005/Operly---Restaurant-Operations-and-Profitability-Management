# Báo Cáo Tiến Độ Triển Khai: Admin Financial Intelligence UI

**Dự án:** Operly – Restaurant Operations and Profitability Management  
**Phạm vi:** Giao diện Quản trị viên (Admin Role Frontend UI)  
**Tài liệu theo dõi:** `docs/admin-financial-intelligence-progress.md`  
**Ngôn ngữ tài liệu:** Tiếng Việt  
**Ngôn ngữ giao diện người dùng Admin:** 100% Tiếng Anh (English UI Only)  

---

## 1. Tổng quan

- **Mục tiêu công việc:**
  - Kiểm tra (Audit) toàn bộ giao diện hiện tại của vai trò Admin trong dự án Operly.
  - Xác định mức độ đáp ứng đối với 9 nhóm tính năng Trí tuệ Tài chính (Financial Intelligence).
  - Triển khai đầy đủ các màn hình, bảng điều khiển, biểu đồ, bảng dữ liệu, bộ lọc và tương tác frontend cho các tính năng còn thiếu trong phân hệ Admin.
  - Tích hợp liền mạch vào hệ thống điều hướng (Navigation) của Admin mà không làm ảnh hưởng đến các tính năng hiện có.
- **Phạm vi được phép chỉnh sửa:**
  - Chỉ chỉnh sửa giao diện frontend thuộc phân hệ Admin (`prototype/src/screens/AdminConsoleScreen.jsx`, các component Admin mới trong `prototype/src/components/admin/`, mock data dành riêng cho Admin nếu cần).
- **Các giới hạn nghiêm ngặt:**
  - KHÔNG chỉnh sửa thư mục `backend/` hoặc bất kỳ mã nguồn backend nào.
  - KHÔNG thay đổi endpoint API, controller, service, DTO, Prisma model, schema hay cấu hình cơ sở dữ liệu.
  - KHÔNG thay đổi logic xác thực (authentication) hay phân quyền (authorization).
  - KHÔNG sửa đổi giao diện của các vai trò khác: Manager, Customer, Kitchen, Waiter, Cashier.
  - KHÔNG thiết kế lại các màn hình Admin không liên quan và KHÔNG xóa bỏ tính năng Admin hiện có (RBAC User Provisioning & Session Invalidation, Immutable System Audit Trail).
  - KHÔNG tích hợp mô hình Machine Learning thực tế, dữ liệu dự báo và khuyến nghị được xây dựng dưới dạng Mock Data chuyên nghiệp phục vụ trải nghiệm giao diện người dùng.

---

## 2. Kết quả kiểm tra giao diện ban đầu

| STT | Chức năng | Trạng thái ban đầu | Giao diện đã có | Phần còn thiếu |
|---|---|---|---|---|
| 1 | **Revenue Analytics** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Thẻ tổng quan doanh thu, doanh thu theo ngày/tuần/tháng, biểu đồ xu hướng doanh thu theo thời gian, cơ cấu doanh thu theo món ăn, danh sách món bán chạy nhất/kém nhất, bộ lọc khoảng thời gian, so sánh với kỳ trước. |
| 2 | **Revenue Forecasting** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Giao diện dự báo doanh thu tương lai theo ngày/tuần/tháng, biểu đồ đối sánh dữ liệu lịch sử và dữ liệu dự báo, thẻ tổng hợp dự báo, chọn kỳ dự báo, trực quan hóa xu hướng với dải độ tin cậy (confidence bands), phân định rõ giá trị thực tế vs dự báo. |
| 3 | **Menu Demand Forecasting** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Dự báo số lượng bán của từng món ăn, dự báo nhu cầu theo ngày/tuần, bảng danh sách món kèm số lượng dự báo, nhãn phân loại nhu cầu cao/thấp, biểu đồ xu hướng nhu cầu, bộ lọc kỳ dự báo. |
| 4 | **Menu Profitability Analysis** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Tổng doanh thu từng món, chi phí nguyên liệu / giá vốn hàng bán (COGS), lợi nhuận gộp từng món, tỷ suất lợi nhuận (profit margin %), bảng so sánh hiệu quả sinh lời, biểu đồ đối sánh doanh thu - chi phí - lợi nhuận, phân loại món theo ma trận lợi nhuận (Stars, Workhorses, Puzzles, Dogs). |
| 5 | **Ingredient Demand Forecasting** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Dự báo nhu cầu nguyên liệu quy đổi từ món ăn, tên nguyên liệu và đơn vị đo, số lượng cần thiết, tồn kho thực tế hiện tại, chênh lệch thiếu hụt ước tính, bảng nhu cầu nguyên vật liệu, bộ lọc kỳ dự báo, thể hiện liên kết định lượng Recipe/BOM. |
| 6 | **Inventory Optimization** | Missing | Chưa có giao diện nào trong AdminConsoleScreen. | Mức tồn kho hiện tại, tồn kho tối thiểu, tồn kho an toàn (Safety Stock), điểm đặt hàng lại (Reorder Point - ROP), số lượng đặt hàng đề xuất (EOQ), cảnh báo tồn kho thấp/dư thừa, chỉ số rủi ro tồn kho, hành động bổ sung hàng đề xuất. |
| 7 | **Loss and Anomaly Detection** | Missing | Admin mới chỉ có nhật ký Audit Log sự kiện thông thường, chưa có hệ thống phát hiện bất thường hay cảnh báo gian lận/thất thoát. | Cảnh báo biến động doanh thu bất thường, cảnh báo tiêu hao nguyên liệu bất thường, cảnh báo chênh lệch kiểm kê (thực tế vs sổ sách), mức độ nghiêm trọng (Critical, Warning, Info), thời điểm phát hiện, các món/nguyên vật liệu bị ảnh hưởng, bảng lịch sử bất thường, hộp thoại chi tiết bối cảnh sự cố. |
| 8 | **Recommendation Engine** | Missing | Chưa có giao diện hệ thống khuyến nghị kinh doanh trong AdminConsoleScreen. | Danh mục khuyến nghị (bổ sung kho, giảm tồn dư, mua hàng, tối ưu lợi nhuận thực đơn, lập kế hoạch nhu cầu, cải thiện hiệu suất), thẻ khuyến nghị chi tiết (tiêu đề, đối tượng liên quan, lý do, dữ liệu dẫn chứng, hành động đề xuất, độ ưu tiên, tác động dự kiến), tính năng đánh dấu đã xem/đã hoàn thành bằng state frontend. |
| 9 | **Financial Intelligence Dashboard** | Missing | Chưa có bảng điều khiển trung tâm về Trí tuệ Tài chính trong Admin. | Tổng hợp tổng doanh thu, doanh thu dự báo, tổng chi phí, lợi nhuận gộp, biên lợi nhuận, tóm tắt rủi ro kho, món nhu cầu cao, món lợi nhuận thấp, cảnh báo bất thường gần nhất, khuyến nghị chờ xử lý, biểu đồ xu hướng doanh thu và lợi nhuận, lối tắt điều hướng nhanh đến 8 phân hệ chi tiết. |

---

## 3. Tiến độ triển khai

### 3.1 Revenue Analytics
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/RevenueAnalyticsView.jsx` và bộ dữ liệu `prototype/src/mock/adminFinancialData.js`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ thống kê KPI tổng quan: Total Period Revenue, Average Ticket Size, Total Order Volume, Gross Profit Margin (kèm % tăng trưởng và so sánh kỳ trước).
  - Trực quan hóa xu hướng doanh thu theo dòng thời gian (biểu đồ cột kép so sánh Doanh thu gộp vs Lợi nhuận gộp vs Chi phí COGS).
  - Bộ chuyển đổi kỳ linh hoạt: Theo ngày (Daily), theo tuần (Weekly), theo tháng (Monthly).
  - Bộ lọc phạm vi thời gian: Last 7 Days, Last 30 Days, Current Month, Q3 2026.
  - Thẻ đối sánh các món ăn bán chạy nhất (Top Performers - Revenue Drivers) và món ăn kém hiệu quả nhất (Lowest Performing & High-Cost Items).
  - Bảng cơ cấu chi tiết doanh thu theo từng món ăn kèm bộ lọc danh mục (All, Hotpot, BBQ / Grill, Appetizers, Drinks), chi phí COGS, lợi nhuận gộp, biên lợi nhuận % và phân loại ma trận thực đơn (Star, Plowhorse, Puzzle, Underperformer).
- **Các thao tác frontend đã hoạt động:**
  - Chuyển đổi linh hoạt giữa các mốc thời gian Daily / Weekly / Monthly với biểu đồ tự động cập nhật số liệu.
  - Lọc món ăn theo danh mục thực đơn.
  - Lựa chọn phạm vi khoảng thời gian (Date range selector).
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.1.
- **Các file liên quan:** `prototype/src/components/admin/financial/RevenueAnalyticsView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.2 Revenue Forecasting
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/RevenueForecastingView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ tóm tắt dự báo: Forecast Horizon Aggregate, Model Precision (MAPE 7.8%), Statistical Confidence Interval (95% CI), Expected Peak Revenue Window.
  - Bộ chuyển đổi kỳ dự báo đa tầng: Dự báo 7 ngày tới (7-Day Daily Horizon), triển vọng 4 tuần tới (4-Week Monthly Outlook), dự báo quý dài hạn (Q4 Long-Range Projection).
  - Trực quan hóa đối sánh giữa dữ liệu lịch sử (Historical Actuals) và dữ liệu dự báo tương lai (Predicted Revenue) trên biểu đồ với dải biên độ tin cậy 95% (Lower Bound - Upper Bound).
  - Phân định rõ giá trị lịch sử và giá trị dự đoán thông qua màu sắc và viền nét đứt.
  - Tương tác chọn từng mốc dự báo để xem chi tiết doanh thu dự phóng, biên độ tin cậy và trạng thái ghi sổ.
  - Bảng lịch trình số liệu chi tiết kèm độ rộng dải tin cậy (Confidence Band Width ±%).
- **Các thao tác frontend đã hoạt động:**
  - Chuyển đổi giữa 3 khoảng dự báo Daily, Weekly, Monthly với biểu đồ và bảng dữ liệu tự động cập nhật đồng bộ.
  - Click vào từng cột mốc dự báo trên biểu đồ để xem chi tiết phân tích ở thanh tóm tắt bên dưới.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.2.
- **Các file liên quan:** `prototype/src/components/admin/financial/RevenueForecastingView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.3 Menu Demand Forecasting
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/MenuDemandForecastingView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ KPI tóm tắt nhu cầu món: Total Predicted Servings, High-Demand Menu Items, Low-Demand / Spoilage Risks, Heaviest Production Peak.
  - Bộ chuyển đổi kỳ dự báo: 7 ngày tới (Next 7 Days - Weekly Prep) và 30 ngày tới (Next 30 Days - Monthly Horizon).
  - Biểu đồ thanh so sánh trực quan số lượng suất ăn dự báo theo từng món ăn kèm mã màu phân định mức độ nhu cầu (High Demand: Xanh ngọc, Moderate: Xanh dương, Low: Đỏ).
  - Bảng chi tiết dự báo nhu cầu từng món kèm số lượng đã bán gần đây, dự báo 7 ngày, dự báo 30 ngày, phân loại nhu cầu, tốc độ tăng trưởng (growth velocity), ngày cao điểm trong tuần và khuyến nghị sơ chế (prep recommendation).
  - Bộ lọc đa tiêu chí: Theo danh mục món ăn (Category) và theo mức độ nhu cầu (Demand Level).
- **Các thao tác frontend đã hoạt động:**
  - Chuyển đổi linh hoạt giữa kỳ 7 ngày và 30 ngày với các cột biểu đồ và bảng tính cập nhật tức thời.
  - Lọc theo danh mục thực đơn và cấp độ nhu cầu.
  - Tương tác chọn món để làm nổi bật thông tin.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.3.
- **Các file liên quan:** `prototype/src/components/admin/financial/MenuDemandForecastingView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.4 Menu Profitability Analysis
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/MenuProfitabilityView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ thống kê tổng hợp: Filtered Menu Revenue, Food Cost (COGS - 31.8%), Gross Profit Realized, Average Gross Margin (68.2%).
  - Biểu đồ đối sánh 3 thanh: Doanh thu (Revenue) vs Giá vốn hàng bán (COGS) vs Lợi nhuận gộp (Gross Profit) cho từng món ăn.
  - Bảng hướng dẫn và phân loại ma trận thực đơn Boston Consulting Group (Menu Engineering Matrix): Star (Món ngôi sao), Plowhorse (Món bò sữa/chủ lực), Puzzle (Món câu đố), Underperformer/Dog (Món kém hiệu quả).
  - Bảng so sánh hiệu quả sinh lời và kinh tế đơn vị (Unit Economics): Giá bán, giá vốn đơn vị, thặng dư đơn vị, số lượng bán, tổng doanh thu, tổng lợi nhuận, % biên lợi nhuận, vai trò trong ma trận thực đơn.
  - Bộ lọc kết hợp: Lọc theo danh mục thực đơn, phân loại ma trận, và sắp xếp theo Lợi nhuận gộp / Doanh thu / Biên lợi nhuận / Lượng bán.
- **Các thao tác frontend đã hoạt động:**
  - Lọc món theo danh mục và ma trận phân loại với tính toán KPI tức thời.
  - Đổi tiêu chí sắp xếp bảng (Sort by Profit, Revenue, Margin %, Units Sold).
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.4.
- **Các file liên quan:** `prototype/src/components/admin/financial/MenuProfitabilityView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.5 Ingredient Demand Forecasting
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/IngredientDemandForecastingView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ thống kê: Imminent Shortage Alerts, Overstock Risk Items, Procurement Lead Time Buffer (24-48h), BOM Recipe Coverage (100% Mapped).
  - Sơ đồ trực quan quy trình phân rã BOM 3 bước: Dự báo nhu cầu món (Dish Demand) → Tỷ lệ định lượng công thức (BOM Factor) → Khoảng thiếu hụt & Đề xuất đơn đặt hàng (PO Requisition).
  - Bộ chuyển đổi kỳ dự báo nguyên vật liệu: 7 ngày tới (7-Day Procurement Horizon) và 30 ngày tới (30-Day Monthly Master Plan).
  - Bảng nhu cầu nguyên vật liệu chi tiết: Tên nguyên liệu, đơn vị đo (kg, pcs), đơn giá ước tính, tồn kho hiện tại, tồn an toàn (Safety Stock), lượng cần thiết theo dự báo, lượng thiếu hụt ước tính (Shortage), trạng thái cảnh báo (Shortage Warning, Overstock Risk, Optimal), và liên kết món ăn kèm định lượng BOM (ví dụ: 0.30 kg / suất).
  - Bộ lọc trạng thái tồn kho (All, Shortage Warning, Replenish Required, Overstock Risk, Optimal).
- **Các thao tác frontend đã hoạt động:**
  - Chuyển đổi linh hoạt giữa chu kỳ 7 ngày và 30 ngày với lượng nguyên liệu cần thiết và lượng thiếu hụt được tính toán lại ngay lập tức.
  - Lọc danh sách nguyên liệu theo trạng thái cảnh báo.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.5.
- **Các file liên quan:** `prototype/src/components/admin/financial/IngredientDemandForecastingView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.6 Inventory Optimization
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/InventoryOptimizationView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ KPI tóm tắt kho: Critical Stockouts Imminent, Reorder Point (ROP) Breaches, Overstock Spoilage Exposure, Target Replenishment Capital (Optimized EOQ).
  - Khối hiển thị công thức chuẩn: Reorder Point (ROP) = (Mức tiêu thụ trung bình ngày × Thời gian giao hàng Lead Time) + Tồn kho an toàn Safety Stock (95% Service Level).
  - Nút hành động phát sinh đơn mua hàng hàng loạt: "Generate Batch Replenishment PO".
  - Bảng sức khỏe tồn kho toàn diện: SKU / Tên nguyên liệu, danh mục, tồn kho thực tế, tồn kho tối thiểu, tồn kho an toàn, điểm đặt hàng lại ROP, lượng đề xuất mua (Recommended Order Qty - EOQ), trạng thái tồn kho (Critical Low, Low Stock, Reorder Point Met, Overstock Risk, Optimal), mức độ rủi ro (High, Medium, Low) và nút bấm "Draft PO" cho từng nguyên liệu.
  - Danh sách chi tiết các hành động bổ sung đề xuất (Suggested Replenishment & Procurement Actions) kèm thời hạn bảo quản (Shelf Life) và thời gian giao hàng (Lead Time).
  - Bộ lọc danh mục nguyên liệu và cấp độ rủi ro.
- **Các thao tác frontend đã hoạt động:**
  - Nhấp "Draft PO" từng món hoặc "Generate Batch Replenishment PO" hiển thị Toast thông báo tương tác tức thời.
  - Lọc theo danh mục hàng hóa và mức độ rủi ro tồn kho.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.6.
- **Các file liên quan:** `prototype/src/components/admin/financial/InventoryOptimizationView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.7 Loss and Anomaly Detection
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/LossAnomalyDetectionView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ KPI phân loại cảnh báo: Critical Alerts (Cảnh báo nghiêm trọng), Warning Alerts (Cảnh báo chú ý), Informational Alerts (Thông tin chi tiết), Financial Loss Exposure (Ước tính thiệt hại tài chính ~12.45M VND).
  - Nút quét chẩn đoán bất thường tự động: "Run System Heuristics Scan".
  - Bảng nhật ký sự cố bất thường (Anomaly Incidents & Discrepancy Audit Log): Thời gian phát hiện (Timestamp), mức độ nghiêm trọng (Critical, Warning, Info), loại bất thường (Revenue Anomaly, Unusual Ingredient Consumption, Inventory Discrepancy, Cashier Discount Anomaly, Price vs Cost), mô tả sự cố, đối tượng bị ảnh hưởng, tỷ lệ % chênh lệch (Variance), trạng thái xử lý và các nút hành động.
  - Hộp thoại chi tiết pháp chứng sự cố (Forensic Detail Modal): Trực quan hóa bối cảnh, mốc chuẩn dự kiến vs số liệu phát hiện thực tế, nguyên nhân gốc rễ (Root Cause), và hành động khắc phục đề xuất (Mitigation).
  - Tính năng đánh dấu đã giải quyết (Mark Case as Resolved) cập nhật trực tiếp state frontend.
  - Bộ lọc đa chiều theo mức độ nghiêm trọng (Severity) và phân loại bất thường (Anomaly Type).
- **Các thao tác frontend đã hoạt động:**
  - Nhấp vào từng dòng để mở Forensic Detail Modal xem bối cảnh và nguyên nhân chi tiết.
  - Nhấp "Resolve" để đổi trạng thái sự cố sang "Resolved" kèm thông báo Toast.
  - Lọc theo mức độ nghiêm trọng và loại bất thường.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.7.
- **Các file liên quan:** `prototype/src/components/admin/financial/LossAnomalyDetectionView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.8 Recommendation Engine
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/RecommendationEngineView.jsx`.
- **Những nội dung đã hoàn thành:**
  - 4 thẻ KPI tóm tắt khuyến nghị: Pending Action Insights (Đang chờ xử lý), Under Review (Đang thẩm định), Completed / Executed (Đã thực thi), Total Quantified Impact (+79.35M VND tiềm năng lợi nhuận và tiết kiệm hàng năm).
  - Nút áp dụng nhanh khuyến nghị ưu tiên: "Apply High-Priority Recommendations".
  - Phân loại toàn diện 6 nhóm khuyến nghị nghiệp vụ: Inventory Replenishment, Overstock Reduction, Ingredient Purchasing, Menu Profitability Improvement, Demand-based Inventory Planning, Business Performance Improvement.
  - Thẻ khuyến nghị chi tiết hiển thị đầy đủ: Mức độ ưu tiên (Critical, High, Medium, Low), danh mục, ID, ngày tạo, tiêu đề, đối tượng tác động (Target Metric), lý do và phát hiện chẩn đoán (Reason & Diagnostic Finding), số liệu dẫn chứng (Supporting Metrics), hành động vận hành đề xuất (Suggested Operational Action), và tác động kinh doanh dự kiến (Expected Business Impact).
  - Hệ thống nút bấm chuyển đổi trạng thái trực tiếp trên frontend: "Mark as Reviewed", "Mark as Completed / Executed", "Reopen Recommendation" với phản hồi Toast thông báo tức thời.
  - Bộ lọc kết hợp: Lọc theo danh mục khuyến nghị, mức độ ưu tiên và trạng thái xử lý (Pending, Reviewed, Completed).
- **Các thao tác frontend đã hoạt động:**
  - Thay đổi trạng thái khuyến nghị (Pending → Reviewed → Completed → Reopen) lưu trực tiếp trong state cục bộ component.
  - Lọc theo danh mục, độ ưu tiên và trạng thái.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.8.
- **Các file liên quan:** `prototype/src/components/admin/financial/RecommendationEngineView.jsx`, `prototype/src/mock/adminFinancialData.js`.

### 3.9 Financial Intelligence Dashboard
- **Trạng thái:** Hoàn thành
- **Những thành phần giao diện đã tạo hoặc chỉnh sửa:** Đã tạo mới component `prototype/src/components/admin/financial/FinancialIntelligenceDashboard.jsx`.
- **Những nội dung đã hoàn thành:**
  - Tiêu đề điều hành Executive Suite kèm tóm tắt biên lợi nhuận tổng thể (68.2%) và doanh thu dự báo tháng tới (728.0M VND).
  - 5 thẻ chỉ số tài chính nòng cốt: Total Revenue (684.5M VND, +10.4%), Forecasted Revenue (728.0M VND, +6.35%), Food Cost COGS (217.7M VND, 31.8%), Gross Profit (466.8M VND, 68.2%), Inventory Risks (3 Critical SKUs).
  - Biểu đồ xu hướng tổng hợp doanh thu, lợi nhuận và chi phí 7 ngày gần nhất.
  - Khối đối chiếu: Món bán chạy nhu cầu cao (High-Demand Dishes) vs Món bị nén biên lợi nhuận (Margin Compression & Low-Profit Dishes).
  - Khối cảnh báo: Cảnh báo bất thường gần nhất (Recent Anomaly & Shrinkage Alerts) vs Khuyến nghị chiến lược ưu tiên (Priority Business Recommendations).
  - Trung tâm lối tắt điều hướng (Financial Intelligence Modules Shortcut Hub) gồm 8 thẻ điều hướng nhanh chuyển ngay đến từng phân hệ chi tiết tương ứng.
- **Các thao tác frontend đã hoạt động:**
  - Nhấp vào các thẻ chỉ số hoặc các nút lối tắt để chuyển ngay lập tức đến từng màn hình chi tiết tương ứng trong bảng điều khiển Admin.
- **Những nội dung còn thiếu:** Không còn, tính năng đã đáp ứng toàn diện yêu cầu mục 4.9.
- **Các file liên quan:** `prototype/src/components/admin/financial/FinancialIntelligenceDashboard.jsx`, `prototype/src/mock/adminFinancialData.js`.

---

## 4. Danh sách file thay đổi

| File | Trạng thái | Nội dung thay đổi |
|---|---|---|
| `docs/admin-financial-intelligence-progress.md` | Created | Tài liệu theo dõi tiến độ kiểm toán và triển khai 9 tính năng Trí tuệ Tài chính bằng Tiếng Việt. |
| `prototype/src/mock/adminFinancialData.js` | Created | Bộ dữ liệu giả lập (Mock Data) chuẩn hóa dành riêng cho Trí tuệ Tài chính Admin (doanh thu, xu hướng thời gian, hiệu suất món, dự báo ARIMA/Prophet, nhu cầu nguyên liệu BOM, tối ưu ROP kho, danh sách bất thường pháp chứng, và danh mục khuyến nghị AI). |
| `prototype/src/components/admin/financial/FinancialIntelligenceDashboard.jsx` | Created | Bảng điều khiển trung tâm tổng hợp 5 KPI điều hành, biểu đồ doanh thu - lợi nhuận - chi phí, khối đối chiếu món và cảnh báo, cùng 8 lối tắt điều hướng nhanh. |
| `prototype/src/components/admin/financial/RevenueAnalyticsView.jsx` | Created | Phân hệ phân tích chuyên sâu doanh thu lịch sử, chuyển đổi Daily/Weekly/Monthly, so sánh kỳ trước, bảng món ăn và xếp hạng bán chạy/kém nhất. |
| `prototype/src/components/admin/financial/RevenueForecastingView.jsx` | Created | Phân hệ dự báo doanh thu đa kỳ (7 ngày, 4 tuần, Quý 4) với dải tin cậy 95% Confidence Interval và phân định rõ dữ liệu lịch sử vs dự báo. |
| `prototype/src/components/admin/financial/MenuDemandForecastingView.jsx` | Created | Phân hệ dự báo lượng tiêu thụ từng món ăn theo chu kỳ 7 ngày / 30 ngày, biểu đồ phân loại nhu cầu và chỉ dẫn sơ chế bếp. |
| `prototype/src/components/admin/financial/MenuProfitabilityView.jsx` | Created | Phân hệ phân tích giá vốn hàng bán (COGS), biên lợi nhuận món, ma trận thực đơn Boston Consulting Group (Star, Plowhorse, Puzzle, Dog). |
| `prototype/src/components/admin/financial/IngredientDemandForecastingView.jsx` | Created | Phân hệ quy đổi nhu cầu món ăn sang định lượng nguyên vật liệu (BOM Recipe), tính toán thiếu hụt kho và cảnh báo tồn trữ. |
| `prototype/src/components/admin/financial/InventoryOptimizationView.jsx` | Created | Phân hệ tối ưu hóa kho hàng, tính điểm đặt hàng lại (ROP), lượng đặt hàng kinh tế (EOQ), cảnh báo tồn kho và tạo đơn mua hàng nháp (Draft PO). |
| `prototype/src/components/admin/financial/LossAnomalyDetectionView.jsx` | Created | Phân hệ phát hiện tổn thất, chênh lệch kiểm kê và gian lận với hộp thoại điều tra pháp chứng chi tiết và nút đánh dấu giải quyết. |
| `prototype/src/components/admin/financial/RecommendationEngineView.jsx` | Created | Động cơ khuyến nghị kinh doanh thông minh 6 danh mục kèm quản lý trạng thái frontend (Pending, Reviewed, Completed, Reopen). |
| `prototype/src/screens/AdminConsoleScreen.jsx` | Modified | Tích hợp hệ thống điều hướng sidebar chuyên nghiệp 2 phân vùng (Financial Intelligence & Security Governance), nhúng toàn bộ 9 phân hệ mới và bảo tồn nguyên vẹn tính năng RBAC và Audit Trail cũ. |
| `prototype/src/store/mockStore.jsx` | Modified | Cập nhật cấu hình khởi tạo `adminTab` mặc định vào `fi-dashboard` và hỗ trợ reset state điều hướng cho Admin. |

---

## 5. Kết quả kiểm tra

- **Build Frontend (`npm --prefix prototype run build`):**
  - Trạng thái: **THÀNH CÔNG (Exit code 0)**.
  - Thời gian build: ~3.99s.
  - Chuyển đổi và đóng gói 1.955 modules hoàn toàn không có lỗi TypeScript/JSX.
- **Kiểm tra hiển thị và điều hướng Admin:**
  - Sidebar bên trái hiển thị đầy đủ 9 chức năng Financial Intelligence và 2 chức năng Governance & Security.
  - Huy hiệu số lượng cảnh báo nổi bật (Badges: 4 cảnh báo bất thường, 5 khuyến nghị chờ xử lý).
  - Khả năng chuyển đổi mượt mà giữa tất cả 11 tab màn hình mà không bị gián đoạn hay mất trạng thái.
  - Bảng điều khiển trung tâm (Executive Dashboard) hỗ trợ các nút bấm lối tắt điều hướng trực tiếp đến 8 phân hệ chuyên sâu.
- **Kiểm tra tương tác frontend (Interactions):**
  - Bộ lọc thời gian (Daily, Weekly, Monthly, 7-day, 30-day, Q3, Q4) hoạt động tức thời trên giao diện.
  - Bộ lọc danh mục thực đơn, danh mục nguyên liệu, phân loại ma trận lợi nhuận, mức độ nghiêm trọng hoạt động chính xác.
  - Thao tác đổi trạng thái khuyến nghị (Mark as Reviewed / Mark as Completed / Reopen) cập nhật ngay lập tức vào state cục bộ.
  - Thao tác giải quyết bất thường (Mark as Resolved) cập nhật trạng thái trong Forensic Detail Modal và bảng nhật ký.
  - Thao tác phát sinh đơn mua hàng nháp (Draft PO) kích hoạt thông báo Toast nổi trên màn hình.
- **Bảo toàn chức năng cũ của Admin:**
  - Tab User Provisioning (SCR-ADM-01): Bảng tài khoản nhân viên, nút kích hoạt/đình chỉ (ACTIVATE / SUSPEND), modal xác nhận suspension, cơ chế vô hiệu hóa session tức thời hoạt động bình thường 100%.
  - Tab Audit Trail (SCR-ADM-02): Bộ lọc sự kiện, lọc ngày, tìm kiếm IP/Actor/Chi tiết, bảng log phân loại màu sắc, nút xuất báo cáo CSV và nút xác minh mã băm cryptographic checksum hoạt động bình thường 100%.
- **Bảo toàn các vai trò khác:**
  - Các màn hình Customer, Kitchen, Waiter, Cashier, Manager hoàn toàn không bị thay đổi.
  - Thanh chuyển đổi vai trò (RoleSwitcherBar) hoạt động bình thường giữa tất cả 6 vai trò.

---

## 6. Sửa lỗi Giao diện: Căn giữa và Cắt xén Modal Chi tiết Bất thường (Loss & Anomaly Details Modal Fix)

### 6.1 Vấn đề ban đầu (Original Problem)
- Khi người dùng ở vai trò Admin truy cập **Financial Intelligence → Loss & Anomaly Alerts** và nhấp nút **Details**, hộp thoại điều tra pháp chứng (Forensic Investigation Modal) xuất hiện lệch vị trí:
  - Modal bị đẩy lên quá cao trên màn hình thay vì được căn giữa hoàn hảo.
  - Phần đỉnh của modal (tiêu đề, badge cảnh báo, nút đóng ✕) bị che khuất đằng sau header cố định của ứng dụng và thanh chuyển đổi vai trò (`RoleSwitcherBar`).
  - Một phần nội dung của modal bị cắt xén (clipping) do vượt quá chiều cao màn hình mà không thể cuộn xem được.
  - Lớp phủ mờ (overlay) và vị trí của modal không phản ứng đúng với việc cuộn trang, thanh sidebar và header.

### 6.2 Nguyên nhân kỹ thuật (Technical Cause)
1. **Lớp phủ Modal Overlay dùng `position: absolute` và `z-index: 50` thấp**:
   - Trong `index.css`, class `.modal-overlay` được định nghĩa với `position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 50;`.
   - Component `LossAnomalyDetectionView` nằm sâu bên trong thẻ `<main style="overflow-y: auto">` thuộc container `.device-desktop`. Do đó, `position: absolute` khiến modal bị bẫy bên trong ngữ cảnh xếp chồng (stacking context) và khung cuộn của thẻ `<main>`, thay vì phủ toàn bộ khung nhìn trình duyệt (viewport).
   - `z-index: 50` thấp hơn thanh `RoleSwitcherBar` (`z-index: 1000`) và header ứng dụng, khiến modal bị header che khuất.
2. **Thiếu giới hạn chiều cao `max-height` và cuộn nội bộ trên Modal Card**:
   - Thẻ `.modal-card` chứa lượng thông tin pháp chứng lớn (mốc thời gian, entity, baseline, giá trị thực tế, diễn giải chi tiết, root cause, mitigation) với tổng chiều cao lên đến ~650px.
   - Do không có thuộc tính `max-height` kết hợp với việc `.modal-overlay` dùng `align-items: center`, khi chiều cao modal vượt quá chiều cao khả dụng của container, modal bị đẩy lệch ngược lên trên (tọa độ âm), khiến phần trên cùng bị chui vào sau header và bị thuộc tính `overflow: hidden` của các container cha cắt bỏ hoàn toàn.

### 6.3 Các file đã chỉnh sửa (Files Modified)
- `prototype/src/components/admin/financial/LossAnomalyDetectionView.jsx`: Tái cấu trúc cơ chế kết xuất modal sử dụng React Portal gắn vào `document.body`, áp dụng layout 3 phần (Pinned Header, Scrollable Body, Pinned Footer), khóa cuộn trang nền và hỗ trợ phím Escape.

### 6.4 Giải pháp đã triển khai (Solution Implemented)
1. **Sử dụng React Portal (`createPortal`) gắn trực tiếp vào `document.body`**:
   - Modal thoát hoàn toàn khỏi mọi container cha có `overflow: hidden`, `overflow-y: auto` và stacking context của `.device-desktop` hay `<main>`.
2. **Cấu hình lớp phủ Viewport cố định (`position: fixed`) với Z-Index tối cao**:
   - `position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;`
   - `zIndex: 99999;` (cao hơn tuyệt đối so với header và RoleSwitcherBar `z-index: 1000`).
   - `display: flex; align-items: center; justify-content: center; padding: 16px;` đảm bảo modal luôn nằm chính giữa viewport cả theo phương ngang lẫn phương dọc.
3. **Cấu trúc lại Modal Card theo mô hình Flexbox 3 phần với giới hạn chiều cao an toàn**:
   - Giới hạn chiều cao: `maxHeight: 'min(90vh, calc(100dvh - 32px))'` đảm bảo modal không bao giờ tràn ra ngoài màn hình trên mọi kích cỡ thiết bị (desktop lẫn laptop màn hình nhỏ).
   - **Header cố định (`flexShrink: 0`)**: Tiêu đề, Severity Badge, ID và nút đóng ✕ luôn cố định ở trên cùng để người dùng luôn nhận biết ngữ cảnh.
   - **Body có thanh cuộn độc lập (`flex: 1; overflow-y: auto`)**: Toàn bộ nội dung điều tra pháp chứng, lưới thông số, root cause, mitigation được cuộn mượt mà bên trong mà không làm xê dịch modal.
   - **Footer cố định (`flexShrink: 0`)**: Nút "Close Inspector" và "Mark Case as Resolved" luôn sẵn sàng để thao tác ở dưới cùng.
4. **Khóa cuộn trang nền (Scroll Lock) và Hỗ trợ phím Escape**:
   - Sử dụng `useEffect` tự động đặt `document.body.style.overflow = 'hidden'` khi modal mở và phục hồi lại khi đóng.
   - Lắng nghe sự kiện bàn phím phím `Escape` để đóng modal tiện lợi và an toàn.

### 6.5 Kết quả kiểm tra (Verification Results)
- [x] **Mở Modal từ Danh sách Anomaly**: Nhấp vào "Details" trên bất kỳ dòng sự cố nào mở modal ngay lập tức qua React Portal.
- [x] **Căn giữa hoàn hảo**: Modal hiển thị chính giữa khung nhìn trình duyệt (cả ngang lẫn dọc).
- [x] **Không bị che khuất đỉnh**: Đỉnh modal và nút đóng ✕ hiển thị rõ ràng, nằm trên header và RoleSwitcherBar.
- [x] **Truy cập nội dung qua cuộn nội bộ**: Toàn bộ thông tin từ Detection Timestamp đến Mitigation Action đều có thể cuộn xem đầy đủ bên trong modal.
- [x] **Cố định vị trí khi cuộn**: Vị trí modal không bị ảnh hưởng bởi thanh cuộn của trang nền.
- [x] **Đóng modal chuẩn xác**: Nút "Close Inspector", nút "✕", nhấp vào vùng ngoài backdrop hoặc nhấn phím `Escape` đều đóng modal và phục hồi cuộn trang.
- [x] **Cập nhật trạng thái "Mark Case as Resolved"**: Nút xử lý sự cố vẫn cập nhật trạng thái sang "Resolved" và kích hoạt Toast thành công.
- [x] **Khả năng tương thích màn hình nhỏ**: Modal tự động co giãn và co thanh cuộn phù hợp trên các độ phân giải laptop có chiều cao hạn chế (768px, 600px).
- [x] **Khóa cuộn trang nền**: Trang nền không bị cuộn lộn xộn trong lúc modal đang mở.

---

## 7. Xác nhận phạm vi

- [x] **Backend:** 100% không có bất kỳ tệp tin nào trong thư mục `backend/` bị chỉnh sửa.
- [x] **API & Database:** 100% không có endpoint API, controller, service, DTO, migration hay Prisma model nào bị tác động.
- [x] **User Roles:** 100% không chỉnh sửa giao diện của Manager, Customer, Kitchen, Waiter, hoặc Cashier.
- [x] **Existing Admin Functionality:** Giữ nguyên 100% tính năng RBAC và Audit Trail nguyên bản của Admin.
- [x] **Ngôn ngữ:** Giao diện Admin tuân thủ 100% Tiếng Anh (English UI Only), tài liệu theo dõi viết 100% bằng Tiếng Việt.
- [x] **GitHub:** Không thực hiện commit hoặc push lên GitHub theo đúng hướng dẫn.
