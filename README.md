# Getting Started

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
