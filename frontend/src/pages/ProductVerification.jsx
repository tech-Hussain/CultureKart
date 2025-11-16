/**
 * Product Verification Page
 * Allows customers to scan QR code and verify product authenticity
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { getImageDisplayUrl } from '../utils/ipfs';

function ProductVerification() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  useEffect(() => {
    if (code) {
      verifyProduct(code);
    }
  }, [code]);

  const verifyProduct = async (verificationCode) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [Frontend] Verifying code:', verificationCode);
      const response = await api.get(`/verification/${verificationCode}`);
      console.log('✅ [Frontend] Verification response:', response.data);

      if (response.data.success) {
        setVerificationResult(response.data);
      } else {
        console.error('❌ [Frontend] Verification failed:', response.data);
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('❌ [Frontend] Verification error:', err);
      console.error('❌ [Frontend] Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to verify product. This may be a counterfeit item.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Verifying product authenticity...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we check our secure database</p>
        </div>
      </div>
    );
  }

  // Error state - Product is NOT authentic
  if (error || !verificationResult) {
    const isTampered = verificationResult?.status === 'tampered';
    const isAlreadyDelivered = verificationResult?.status === 'already_delivered';
    const deliveryInfo = verificationResult?.deliveryInfo || {};
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-500">
          <div className="text-center">
            {/* Warning Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6 animate-pulse">
              <span className="text-6xl">{isTampered ? '🚨' : isAlreadyDelivered ? '📦' : '⚠️'}</span>
            </div>

            <h1 className="text-4xl font-bold text-red-700 mb-4">
              {isTampered ? '🚨 SECURITY ALERT' : isAlreadyDelivered ? '📦 ALREADY DELIVERED' : '⚠️ VERIFICATION FAILED'}
            </h1>

            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
              <p className="text-xl text-red-800 font-semibold mb-3">
                {error || (isAlreadyDelivered ? 'This QR code was already used!' : 'This product could not be verified!')}
              </p>
              <p className="text-base text-red-700">
                {isTampered 
                  ? 'This QR code has been detected as tampered or copied. The blockchain hash does not match our records.' 
                  : isAlreadyDelivered
                    ? `This QR code was already confirmed for delivery ${deliveryInfo.originalDeliveryTime ? 'on ' + new Date(deliveryInfo.originalDeliveryTime).toLocaleString() : 'previously'}. Someone may have copied this onto another package.`
                    : 'This verification code does not exist in our secure database. This product may be counterfeit.'}
              </p>
            </div>

            {isTampered && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center justify-center gap-2">
                  <span>🔴</span> CRITICAL WARNING
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Our system detected that someone has copied a legitimate blockchain transaction hash 
                  and created a fake QR code. This is a sophisticated counterfeiting attempt.
                </p>
                <p className="text-sm text-orange-800 font-semibold">
                  DO NOT accept this product. Report this immediately to authorities and CultureKart support.
                </p>
              </div>
            )}

            {isAlreadyDelivered && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center justify-center gap-2">
                  <span>⚠️</span> QR CODE REUSE DETECTED
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  This QR code was already used for delivery confirmation. Someone has copied this 
                  legitimate QR code and placed it on a different package.
                </p>
                <p className="text-sm text-orange-800 font-semibold">
                  Original delivery location: {deliveryInfo.originalLocation || 'Unknown'}
                </p>
                <p className="text-sm text-orange-800 font-semibold mt-2">
                  DO NOT accept this package. This is a counterfeit using a copied QR code.
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center justify-center gap-2">
                <span>🛡️</span> What This Means
              </h3>
              <ul className="text-left text-sm text-yellow-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>This product was NOT purchased from CultureKart official channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>The QR code may have been copied or tampered with</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>This could be a counterfeit or replica product</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>We cannot guarantee the quality or authenticity of this item</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                to="/shop"
                className="btn-primary w-full py-4 text-lg inline-block"
              >
                🛒 Shop Authentic Products
              </Link>
              <Link
                to="/"
                className="btn-secondary w-full py-3 inline-block"
              >
                Return to Homepage
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Report counterfeit products: support@culturekart.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle delivery confirmation
  const handleConfirmDelivery = async () => {
    try {
      setConfirmingDelivery(true);
      
      // Create device fingerprint (simple version)
      const deviceFingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;
      
      const response = await api.post(`/verification/${code}/confirm-delivery`, {
        deviceFingerprint,
      });

      if (response.data.success) {
        setDeliveryConfirmed(true);
        // Refresh verification to get updated status
        setTimeout(() => {
          verifyProduct(code);
        }, 1000);
      }
    } catch (err) {
      console.error('Delivery confirmation error:', err);
      alert(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setConfirmingDelivery(false);
    }
  };

  // Success state - Product IS authentic
  const { productInfo, verificationInfo } = verificationResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        <div className={`bg-gradient-to-r rounded-2xl shadow-2xl p-8 mb-8 text-white text-center ${
          verificationInfo.isDelivered 
            ? 'from-blue-500 to-cyan-600' 
            : 'from-green-500 to-emerald-600'
        }`}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4">
            <span className="text-6xl">{verificationInfo.isDelivered ? '📦✅' : '✅'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {verificationInfo.isDelivered ? 'DELIVERED & VERIFIED!' : 'AUTHENTIC PRODUCT!'}
          </h1>
          <p className="text-xl opacity-90">
            {verificationInfo.isDelivered 
              ? `Delivery confirmed ${verificationInfo.deliveredAt ? 'on ' + new Date(verificationInfo.deliveredAt).toLocaleDateString() : ''}` 
              : 'This is a genuine CultureKart handcrafted product'}
          </p>
          {verificationInfo.totalVerifications > 1 && (
            <p className="text-sm opacity-75 mt-2">
              Scanned {verificationInfo.totalVerifications} times
            </p>
          )}
        </div>

        {/* Delivery Confirmation Section */}
        {!verificationInfo.isDelivered && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-orange-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <h2 className="text-2xl font-bold text-orange-900 mb-3">
                Receiving This Package?
              </h2>
              <p className="text-orange-800 mb-6 max-w-2xl mx-auto">
                <strong>IMPORTANT:</strong> If you are receiving this package right now, please confirm delivery below. 
                This is a <strong>ONE-TIME action</strong> that locks the QR code and prevents reuse.
              </p>
              
              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-3 flex items-center justify-center gap-2">
                  <span>⚠️</span> Before Confirming
                </h3>
                <ul className="text-left text-sm text-orange-800 space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Verify the package seal is intact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Check product matches your order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Confirm this QR code is on the original package</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>You are physically receiving the package now</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleConfirmDelivery}
                disabled={confirmingDelivery || deliveryConfirmed}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {confirmingDelivery ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Confirming...
                  </span>
                ) : deliveryConfirmed ? (
                  '✓ Delivery Confirmed!'
                ) : (
                  '📦 Confirm Delivery Reception'
                )}
              </button>

              <p className="text-xs text-orange-600 mt-4">
                After confirmation, this QR code will be locked and cannot verify future packages
              </p>
            </div>
          </div>
        )}

        {/* Scan History Section */}
        {verificationResult.scanHistory && verificationResult.scanHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span>📜</span>
              Verification History
            </h2>
            <p className="text-gray-600 mb-6">
              This product has been scanned <strong>{verificationInfo.totalVerifications} time(s)</strong>. 
              Below are the most recent verification attempts:
            </p>
            
            <div className="space-y-3">
              {verificationResult.scanHistory.map((scan, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {scan.status === 'success' ? '✅' : scan.status === 'tampered' ? '🚨' : '⚠️'}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {index === 0 ? 'Current Scan' : `Scan ${index + 1}`}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            LATEST
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <strong>Time:</strong> {scan.timeAgo} ({new Date(scan.timestamp).toLocaleString()})
                        </p>
                        <p>
                          <strong>Location:</strong> {scan.location || 'Unknown'}
                        </p>
                        <p>
                          <strong>Status:</strong> 
                          <span className={`ml-2 font-semibold ${
                            scan.status === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {scan.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {verificationInfo.totalVerifications > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing last 10 scans of {verificationInfo.totalVerifications} total
              </p>
            )}
          </div>
        )}

        {/* Product Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📦</span>
            Product Information
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            {productInfo.image && (
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <img
                  src={getImageDisplayUrl(productInfo.image)}
                  alt={productInfo.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-64 bg-gradient-to-br from-orange-200 to-pink-200 rounded-lg flex items-center justify-center text-6xl">🎨</div>';
                  }}
                />
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Product Name</label>
                <p className="text-xl font-bold text-gray-900 mt-1">{productInfo.title}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Category</label>
                <p className="text-lg text-gray-800 mt-1">{productInfo.category}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Artisan</label>
                <p className="text-lg text-gray-800 mt-1 flex items-center gap-2">
                  <span>👨‍🎨</span>
                  {productInfo.artisan}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Price</label>
                <p className="text-2xl font-bold text-green-700 mt-1">Rs {productInfo.price}</p>
              </div>

              {productInfo.orderDate && (
                <div className="pb-3">
                  <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Order Date</label>
                  <p className="text-lg text-gray-800 mt-1">
                    {new Date(productInfo.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        {verificationResult.blockchainInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">⛓️</span>
              Blockchain Verification
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`rounded-xl p-4 border ${
                verificationResult.blockchainInfo.blockchainVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <label className="text-sm font-semibold uppercase tracking-wide ${
                  verificationResult.blockchainInfo.blockchainVerified 
                    ? 'text-green-700' 
                    : 'text-yellow-700'
                }">Blockchain Status</label>
                <p className={`text-lg font-bold mt-1 flex items-center gap-2 ${
                  verificationResult.blockchainInfo.blockchainVerified 
                    ? 'text-green-900' 
                    : 'text-yellow-900'
                }`}>
                  {verificationResult.blockchainInfo.blockchainVerified ? (
                    <>
                      <span className="text-green-500">✅</span>
                      Blockchain Verified
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-500">⏳</span>
                      Pending Registration
                    </>
                  )}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <label className="text-sm text-green-700 font-semibold uppercase tracking-wide">Hash Integrity</label>
                <p className="text-lg font-bold text-green-900 mt-1 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Verified
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Blockchain hash matches order record
                </p>
              </div>

              {verificationResult.blockchainInfo.ipfsHash && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <label className="text-sm text-blue-700 font-semibold uppercase tracking-wide">IPFS Metadata</label>
                  <p className="text-sm font-mono text-blue-900 mt-1 break-all">
                    {verificationResult.blockchainInfo.ipfsHash.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>

            {verificationResult.blockchainInfo.transactionHash && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <label className="block text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">
                  🔗 Ethereum Blockchain Transaction
                </label>
                <div className="bg-white rounded-lg p-4 mb-4 border border-purple-300">
                  <p className="text-xs text-gray-600 mb-2">Transaction Hash:</p>
                  <p className="text-sm font-mono text-gray-800 break-all mb-3">
                    {verificationResult.blockchainInfo.transactionHash}
                  </p>
                  {verificationResult.blockchainInfo.blockchainVerified && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${verificationResult.blockchainInfo.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <span>🔍</span>
                      View on Etherscan
                    </a>
                  )}
                </div>
                <p className="text-xs text-purple-700">
                  This product's provenance has been permanently recorded on the Ethereum blockchain, ensuring immutable proof of authenticity.
                </p>
              </div>
            )}

            {!verificationResult.blockchainInfo.blockchainVerified && (
              <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Blockchain registration is still in progress. This does not affect product authenticity - 
                  the secure QR code system has already verified this as a genuine CultureKart product.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verification Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            Verification Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {verificationInfo.orderNumber && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <label className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Order Number</label>
                <p className="text-lg font-bold text-blue-900 mt-1">{verificationInfo.orderNumber}</p>
              </div>
            )}

            {verificationInfo.firstVerified && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <label className="text-sm text-green-700 font-semibold uppercase tracking-wide">First Verified</label>
                <p className="text-lg font-bold text-green-900 mt-1">
                  {new Date(verificationInfo.firstVerified).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <label className="text-sm text-purple-700 font-semibold uppercase tracking-wide">Total Scans</label>
              <p className="text-lg font-bold text-purple-900 mt-1">{verificationInfo.totalVerifications || 1}</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <label className="text-sm text-emerald-700 font-semibold uppercase tracking-wide">Security Status</label>
              <p className="text-lg font-bold text-emerald-900 mt-1 flex items-center gap-2">
                {verificationInfo.isSuspicious ? (
                  <>
                    <span className="text-yellow-500">⚠️</span>
                    Multiple Scans Detected
                  </>
                ) : (
                  <>
                    <span className="text-green-500">✅</span>
                    Secure
                  </>
                )}
              </p>
            </div>
          </div>

          {verificationInfo.isSuspicious && (
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This product has been scanned multiple times. While this is normal for display items,
                if you just received this product, please contact our support team.
              </p>
            </div>
          )}
        </div>

        {/* Security Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            Anti-Counterfeiting Technology
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>Unique QR Code:</strong> Each product has a one-time-use secure verification code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>Encrypted Hash:</strong> Random hash mapping prevents code replication</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>Real-time Verification:</strong> Instant authentication against our secure database</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>Blockchain Verification:</strong> Product provenance recorded on Ethereum blockchain</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>IPFS Storage:</strong> Immutable product metadata stored on decentralized network</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong>Cross-Verification:</strong> QR code validated against blockchain transaction</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 bg-white rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-blue-700">Important:</strong> This QR code is printed on your product's authentic packaging. 
              Any duplication or tampering will be detected by our security system. Always verify your product upon delivery.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center space-y-4">
          <Link
            to="/shop"
            className="btn-primary px-8 py-4 text-lg inline-block"
          >
            🛒 Continue Shopping
          </Link>
          <Link
            to="/"
            className="btn-secondary px-8 py-3 inline-block ml-4"
          >
            Return to Home
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact us at support@culturekart.com
        </p>
      </div>
    </div>
  );
}

export default ProductVerification;
