# Getting Started

## Important

-   Ở những lần chạy đầu tiên API có thể sẽ trả về lỗi như:
    -   `Traffic error`: Lỗi traffic, có thể thử lại bằng cách sửa thông số anti-detect hoặc IP
    -   `Pls Solve captcha`: Shopee yêu cầu giải captcha, Chạy trình duyệt lên bằng Query `browser=true` như hướng dẫn ở dưới để mở trình duyệt và giải captcha thủ công. Hoặc cài extention giải tự động (noCaptchaAI)
    -   `Pls Login again`: Shopee Yêu cầu đăng nhập, Chạy trình duyệt lên bằng Query `browser=true` để đăng nhập.

## Downloads

-   Tải File: [browser.zip](https://drive.google.com/drive/folders/13lKwYRoA6rRgM3a70EdynPuf-4cY0Rft?usp=share_link)
-   Giải nén file `browser.zip` vào folder gốc của project

## Installation

1. **Clone the repository**

    ```sh
    git clone https://github.com/AnhNT21/shopCrawl.git
    cd shopCrawl
    ```

2. **Install dependencies**

    ```sh
    npm install
    ```

3. **Configure environment**

    - Copy `.env.example` thành `.env` và cập nhật
    - File `settings.js`: Chứa các cái đặt liên quan tới trình duyệt anti-detect

4. **Run App**
    ```sh
    npm start
    ```

## API Usage

### 1. Lấy danh sách sản phẩm trong shop

lấy danh sách sản phẩm trực tiếp trong shop, Lưu file dữ liệu đã get vào `/data/${shop_username}.json`

-   **Method**: `GET`
-   **Path**: `/shop/${shop_username}/allProduct?browser=true`

    | Tên Biến        | Kiểu Dữ liệu | Mô tả                                     | bắt buộc |
    | --------------- | ------------ | ----------------------------------------- | -------- |
    | `shop_username` | string       | username của shop cần lấy                 | Có       |
    | `browser`       | boolean      | Mở trình duyệt (for debug, captcha solve) | Không    |

-   **Sample response**:

    ```json
        {
            "msg": [],
            "allProducts": [
                {
                    "itemid": 18593348616,
                    "shopid": 52679373,
                    "item_card_display_price": {
                        "item_id": 18593348616,
                        "model_id": 99442194654,
                        "promotion_type": 201,
                        "promotion_id": 611536050736128,
                        "price": 78000000000,
                        "strikethrough_price": 129900000000,
                        "discount": 40
                    },
                    ...
                    "item_card_displayed_asset": {
                        "name": "Webcam Full HD Logitech Brio 100 - Cân bằng ánh sáng, Mic, Màn chập, USB-A, Google Meet, Zoom",
                        "image": "vn-11134207-7r98o-llx6wnzluti7f6",
                        "images": [
                            "vn-11134207-7r98o-llx6wnzluti7f6",
                            "vn-11134207-7r98o-llx6wnzlw82n3a",
                            ...
                        ],
                    ...
                }
            ]
        }
    ```

    | Tên Biến      | Kiểu Dữ liệu | Mô tả                              | Note                                                                           |
    | ------------- | ------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
    | `msg`         | `string[]`   | Các lỗi trong quá trình chạy app   | `Not equal` Tổng số sản phẩm đã lấy có thể không trùng với số sẩn phẩm thực tế |
    | `allProducts` | `Object[]`   | Các sản phẩm đã lấy được **(RAW)** |                                                                                |

### 2. Lấy danh sách sản phẩm trong shop (Cache)

lấy danh sách sản phẩm trong shop từ file dữ liệu trong `/data/${shop_username}.json`

-   **Method**: `GET`
-   **Path**: `/shop/${shop_username}/allProductCache`

    | Tên Biến        | Kiểu Dữ liệu | Mô tả                     | bắt buộc |
    | --------------- | ------------ | ------------------------- | -------- |
    | `shop_username` | string       | username của shop cần lấy | Có       |

-   **Sample response**:

    ```json
            [
                {
                "itemid": 18593348616,
                "shopid": 52679373,
                "item_card_display_price": {
                    "item_id": 18593348616,
                    "model_id": 99442194654,
                    "promotion_type": 201,
                    "promotion_id": 611536050736128,
                    "price": 78000000000,
                    "strikethrough_price": 129900000000,
                    "discount": 40
                },
                ...
                "item_card_displayed_asset": {
                    "name": "Webcam Full HD Logitech Brio 100 - Cân bằng ánh sáng, Mic, Màn chập, USB-A, Google Meet, Zoom",
                    "image": "vn-11134207-7r98o-llx6wnzluti7f6",
                    "images": [
                        "vn-11134207-7r98o-llx6wnzluti7f6",
                        "vn-11134207-7r98o-llx6wnzlw82n3a",
                        ...
                    ],
                }
                ...
            }
        ]

    ```

### 3. Lấy thông tin chi tiết sản phẩm

Lấy thông tin chi tiết của một sản phẩm cụ thể từ shop.

-   **Method**: `GET`
-   **Path**: `/shop/${shop_username}/getItem`

    | Tên Biến        | Kiểu Dữ liệu | Mô tả                                     | bắt buộc |
    | --------------- | ------------ | ----------------------------------------- | -------- |
    | `browser`       | boolean      | Mở trình duyệt (for debug, captcha solve) | Không    |
    | `shop_username` | string       | username của shop chứa sản phẩm           | Có       |
    | `item_name`     | string       | Tên của sản phẩm cần lấy                  | Có       |
    | `itemid`        | number       | ID của sản phẩm                           | Có       |
    | `shopid`        | number       | ID của shop chứa sản phẩm                 | Có       |

-   **Sample request**:

    ```sh
    curl "localhost:3000/shop/logitech_officialshop/getItem?item_name=Chuột không dây bluetooth Logitech Signature M650 - SmartWheel, giảm ồn, tùy chỉnh các nút&itemid=13375581982&shopid=52679373"
    ```

-   **Sample response**:
    ```json
        {
            "msg": "Product detail fetched successfully",
            "productDetail": {
                "item_id": 13375581982,
                "shop_id": 52679373,
                "item_status": "normal",
                "status": 1,
                "item_type": 0,
                "reference_item_id": "",
                "title": "Chuột không dây bluetooth Logitech Signature M650 - SmartWheel, giảm ồn, tùy chỉnh các nút",
                "image": "sg-11134201-22100-7r755kijlliv3f",
                ...
                "brand": "Logitech",
                "brand_id": 2240095,
                "show_discount": 29,
                "ctime": 1644208265,
                "item_rating": {
                    "rating_star": 4.918693693693694
                },
                "cb_option": 0,
                "has_model_with_available_shopee_stock": false,
                "shop_location": "TP. Hồ Chí Minh",
                "attributes": [
                    {
                        "name": "Kiểu kết nối",
                        "value": "Không dây",
                        "id": 100408,
                        "is_timestamp": false,
                        "brand_option": null,
                        "val_id": 2530,
                        "url": null,
                        "brand_id": null,
                        "full_url": null,
                        "type": null
                    },
                    ...
                ],
                "rich_text_description": {
                    "paragraph_list": [
                        ...
                        {
                            "type": 0,
                            "text": "Các tính năng linh hoạt của chuột ...",
                            "img_id": null,
                            "ratio": null,
                            "empty_paragraph_count": null
                        },
                        {
                            "type": 0,
                            "text": "**Thời gian sử dụng pin có thể thay đổi tùy theo người dùng và điều kiện sử dụng máy tính",
                            "img_id": null,
                            "ratio": null,
                            "empty_paragraph_count": null
                        },
                       ...
                    ]
                },
                ...
                "description": "\nThương hiệu Logitech\nSản xuất tại Trung Quốc\nBảo hành chính ... "
               ...
            }
        }
    ```
