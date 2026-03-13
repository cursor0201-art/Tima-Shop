import requests
import os
from django.conf import settings

def send_telegram_notification(order, receipt=None):
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    if not token or not chat_id:
        print("Telegram credentials not found in environment.")
        return

    # Structure the message
    message = f"🆕 *Новый заказ: #{order.order_number}*\n\n"
    message += f"👤 *Клиент:* {order.customer_name}\n"
    message += f"📞 *Телефон:* {order.customer_phone}\n"
    message += f"📍 *Адрес:* {order.customer_address}\n"
    message += f"💬 *Комментарий:* {order.customer_comment or 'Нет'}\n\n"
    
    message += "📦 *Товары:*\n"
    items = order.items.all()
    for item in items:
        message += f"- {item.product_name_snapshot} ({item.sku_snapshot}) x{item.qty} — {item.line_total} сум\n"
    
    message += f"\n💰 *Итого:* {order.total} сум"
    if order.shipping_fee:
        message += f" (вкл. доставку {order.shipping_fee} сум)"
    
    if order.status == 'PAID':
        message += "\n✅ *Статус:* ОПЛАЧЕНО"
    elif order.status == 'RECEIPT_SUBMITTED':
        message += "\n🧾 *Статус:* ЧЕК ОТПРАВЛЕН (ОЖИДАЕТ ПРОВЕРКИ)"
        message += "\n\n📢 *Customer submitted a payment receipt. Manual verification required.*"
    else:
        message += f"\n🔄 *Статус:* {order.get_status_display()}"

    # Try to get the photo: either the receipt or the first product image
    photo_file = None
    photo_url = None
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000').rstrip('/')

    if receipt and receipt.receipt_image:
        try:
            # Prefer sending the actual file for receipts (more reliable)
            photo_file = receipt.receipt_image.open('rb')
        except Exception as e:
            print(f"DEBUG: Could not open receipt file: {e}")
            photo_url = f"{site_url}{receipt.receipt_image.url}"
    else:
        first_item = items.first()
        if first_item and first_item.product:
            main_image = first_item.product.images.filter(is_main=True).first() or first_item.product.images.first()
            if main_image:
                photo_url = main_image.image_url
                if photo_url.startswith('/'):
                    photo_url = f"{site_url}{photo_url}"
                elif photo_url.startswith('media/'):
                    photo_url = f"{site_url}/{photo_url}"

    try:
        if photo_file:
            url = f"https://api.telegram.org/bot{token}/sendPhoto"
            files = {"photo": photo_file}
            data = {
                "chat_id": chat_id,
                "caption": message,
                "parse_mode": "Markdown"
            }
            response = requests.post(url, data=data, files=files)
            photo_file.close()
        elif photo_url:
            url = f"https://api.telegram.org/bot{token}/sendPhoto"
            payload = {
                "chat_id": chat_id,
                "photo": photo_url,
                "caption": message,
                "parse_mode": "Markdown"
            }
            response = requests.post(url, json=payload)
        else:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }
            response = requests.post(url, json=payload)

        print(f"DEBUG: Telegram API Response ({response.status_code}): {response.text}")
        response.raise_for_status()
    except Exception as e:
        print(f"Error sending Telegram notification: {e}")
        if 'photo_file' in locals() and photo_file:
            photo_file.close()
