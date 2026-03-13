import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MessageCircle, Clock, XCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { shopApi } from '@/services/api';

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || 'TS-0000';
  const publicToken = searchParams.get('token');
  const telegramUrl = 'https://t.me/tima_shop';
  
  const [orderStatus, setOrderStatus] = useState<string>('PENDING');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(!!publicToken);
  const [instructions, setInstructions] = useState<{card_number: string, card_holder: string, instructions: string} | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicToken) return;

    const fetchStatus = async () => {
      try {
        const order = await shopApi.getOrderByToken(publicToken);
        setOrderData(order);
        setOrderStatus(order.status);
      } catch (err) {
        console.error("Failed to fetch order status:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInstructions = async () => {
      try {
        const data = await shopApi.getPaymentInstructions();
        setInstructions(data);
      } catch (err) {
        console.error("Failed to fetch payment instructions:", err);
      }
    };

    fetchStatus();
    fetchInstructions();

    fetchStatus();
    fetchInstructions();
  }, [publicToken]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!publicToken || !receiptFile) return;
    setUploadLoading(true);
    try {
      await shopApi.submitReceipt(orderNumber, receiptFile, note);
      setUploadSuccess(true);
      setOrderStatus('RECEIPT_SUBMITTED');
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  const renderStatus = () => {
    if (loading) return <p className="text-muted-foreground text-center">{t('common.loading')}</p>;

    switch (orderStatus) {
      case 'PAID':
        return (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 text-center">
            <CheckCircle size={64} className="text-success mb-6" />
            <h1 className="text-3xl font-bold mb-2">{t('orderSuccess.paid')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('orderSuccess.orderNumber', { number: orderNumber })}
            </p>
          </div>
        );
      case 'RECEIPT_SUBMITTED':
      case 'PAYMENT_SUBMITTED':
        return (
          <div className="flex flex-col items-center text-center">
            <CheckCircle size={64} className="text-info mb-6" />
            <h1 className="text-3xl font-bold mb-2">Чек отправлен</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {t('orderSuccess.orderNumber', { number: orderNumber })}
            </p>
            <div className="bg-muted p-4 rounded-lg mb-8 max-w-md">
              <p className="text-sm font-medium">Мы проверим оплату. Спасибо!</p>
            </div>
          </div>
        );
      case 'CANCELED':
        return (
          <div className="flex flex-col items-center text-center">
            <XCircle size={64} className="text-destructive mb-6" />
            <h1 className="text-3xl font-bold mb-2">{t('orderSuccess.canceled')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('orderSuccess.orderNumber', { number: orderNumber })}
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <Clock size={64} className="text-warning mb-6" />
            <h1 className="text-3xl font-bold mb-2">{t('orderSuccess.pending')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('orderSuccess.orderNumber', { number: orderNumber })}
            </p>

            {instructions && (
              <div className="w-full max-w-md text-left bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Payment Instructions</h3>
                <div className="space-y-4 mb-6">
                  {orderData && (
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mb-4">
                        <p className="text-xs text-primary uppercase tracking-wider mb-1 font-bold">Total Amount to Pay</p>
                        <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat().format(orderData.total)} sum</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Card Number</p>
                    <div className="flex items-center gap-2">
                        <p className="flex-1 text-lg font-mono font-bold bg-muted p-2.5 rounded select-all">{instructions.card_number}</p>
                        <button 
                            onClick={() => handleCopy(instructions.card_number)}
                            className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                            {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
                        </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Card Holder</p>
                    <p className="font-semibold">{instructions.card_holder}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 italic">{instructions.instructions}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-bold">Upload Receipt</h4>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="receipt" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="receipt"
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                        receiptFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {receiptFile ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle className="text-primary shrink-0" size={20} />
                          <span className="truncate text-sm font-medium">{receiptFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm font-medium">Click to select receipt</p>
                          <p className="text-xs text-muted-foreground mt-1">Image files only (JPG, PNG...)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {receiptFile && (
                    <button
                      onClick={handleUpload}
                      disabled={uploadLoading}
                      className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {uploadLoading ? 'Uploading...' : 'I paid / Submit receipt'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="container-shop py-12 flex flex-col items-center">
      {renderStatus()}
      
      <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
        {orderStatus === 'PAID' 
          ? t('orderSuccess.messagePaid') 
          : orderStatus === 'RECEIPT_SUBMITTED' || orderStatus === 'PAYMENT_SUBMITTED'
            ? "We are currently checking your receipt. You will be notified once it's confirmed."
            : t('orderSuccess.messagePending')}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-8 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-colors"
        >
          <MessageCircle size={18} />
          {t('orderSuccess.contactManager')}
        </a>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
        >
          {t('orderSuccess.backToHome')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
