## BV API

## Job domain

- Object:

  - /job/job, /job/step
  - JobStep status = "new", "ready", "running", "done"

- Thông tin job, gọi ở giao diện khám, xét nghiệm và quầy thuốc

```
GET /api/job/job/get?id=<string>
## response
<JobNS.ViewJob>
```

- Đặt trạng thái job, lưu các thông tin chung về lượt khám

```
GET /api/job/job/state
{
  "id": "<string>",
  "state": {"a": 1},
}
```

- Tạo phiếu khám

```
POST /api/job/job/customer/service
{
  "customer_id": "<string>",
  "service_id": "<string>",
  "service_policy_id": "<string>",
  "location_id": "<string>"
}
## response
<JobNS.JobView>
```

- Danh sách bệnh nhân chờ khám, xét nghiệm

```
GET /api/job/step/list?location_id=<string>&status=new,ready&customer_id=<string>
## response
<JobNS.JobStepView[]>
```

- Chỉ định xét nghiệm:

```
POST /api/job/step/add
{
  "job_id": "<string>",
  "location_id": "<string>",
  "items": [{
     "ref": "service|product",
     "ref_id": "<string>"
  }]
}
## response
<JobNS.StepView>
```

- Cập nhật kết quả khám, xét nghiệm

```
POST /api/job/step/finish
{
  "id": "<string>",
  "result": "<object>"
}
```

## Customer domain
- Tạo khách hàng:
```
POST /api/customer/customer/create
{
  "full_name": "<string>",
  "gender": "male|female",
  "birthday": "<Date: YYYY-MM-DD>",
  "code": "<string, optional>"
}
## response
<CustomerNS.ViewCustomer>
```
- Lấy thông tin khách hàng:
```
GET /api/customer/customer/get?id=<string>&code=<string>
## sử dụng id hoặc code
## response
<CustomerNS.ViewCustomer>
```
- Thêm contact cho khách hàng:
```
POST /api/customer/customer/add
{
  "customer_id": "<string>",
  "full_name": "<string>",
  "address": "<string>",
  "phone": "<string>",
  "idnum": "<string>",
  "idtype": "cmnd|cccd",
  "relation": "<string>
}
## response
<CustomerNS.Contact>
```
- Sửa contact đã có:
```
POST /api/customer/customer/update
{
  "id": "<string>",
  "full_name": "<string>",
  "address": "<string>",
  "phone": "<string>",
  "idnum": "<string>",
  "idtype": "cmnd|cccd",
  "relation": "<string>
}
```
- Xóa contact:
```
POST /api/customer/customer/remove
{
  "id": "<string>"
}
```
