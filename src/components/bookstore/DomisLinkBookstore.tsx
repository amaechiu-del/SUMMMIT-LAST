/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, ShoppingBag, Shield, CheckCircle, 
  ExternalLink, Eye, X, Send, CreditCard, Sparkles, Download, FileText,
  Printer, Smartphone, Award, User, Building2
} from 'lucide-react';
import { INITIAL_DOMISLINK_BOOKS, BookProduct } from '../../data/bookstoreData';
import jsPDF from 'jspdf';

export default function DomisLinkBookstore() {
  const [books, setBooks] = useState<BookProduct[]>(INITIAL_DOMISLINK_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [previewBook, setPreviewBook] = useState<BookProduct | null>(null);
  const [checkoutBook, setCheckoutBook] = useState<BookProduct | null>(null);
  const [checkoutFormat, setCheckoutFormat] = useState<'SOFT_COPY' | 'HARD_COPY'>('SOFT_COPY');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ bookTitle: string; format: string; orderId: string; email: string; date: string } | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const [purchasedBooks, setPurchasedBooks] = useState<Array<{ bookTitle: string; format: string; orderId: string; email: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem('domislink_purchased_books');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    { id: 'ALL', label: 'All Publications' },
    { id: 'AVIATION_SAFETY', label: 'Aviation Safety' },
    { id: 'AIRLINES', label: 'Airlines & Ops' },
    { id: 'AIRPORTS', label: 'Airports & Infrastructure' },
    { id: 'HUMAN_FACTORS', label: 'Human Factors' },
    { id: 'SIMULATION', label: 'Flight Simulation' },
    { id: 'TECHNOLOGY', label: 'Technology & AI' },
    { id: 'LEADERSHIP', label: 'Leadership & Culture' },
    { id: 'INVESTMENT', label: 'Investment & Finance' },
    { id: 'PASSENGER_SAFETY', label: 'Passenger Trust' },
    { id: 'REGULATION', label: 'Regulation & NSIB' }
  ];

  const filteredBooks = books.filter(b => {
    if (b.status !== 'PUBLISHED' && b.status !== 'APPROVED') return false;

    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesFormat = selectedFormat === 'ALL' || b.format === selectedFormat;

    return matchesSearch && matchesCategory && matchesFormat;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook || !customerName.trim() || !customerEmail.trim()) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const orderId = `DLK-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder = {
        bookTitle: checkoutBook.title,
        format: checkoutFormat === 'SOFT_COPY' ? 'Digital Soft Copy (PDF / EPUB Excerpt Edition)' : 'Hard Copy (Printed Book - Fulfillment Dispatched)',
        orderId,
        email: customerEmail,
        date: new Date().toLocaleDateString()
      };
      
      const updated = [newOrder, ...purchasedBooks];
      setPurchasedBooks(updated);
      try {
        localStorage.setItem('domislink_purchased_books', JSON.stringify(updated));
      } catch {}

      setOrderSuccess(newOrder);
      setCheckoutBook(null);
    }, 1800);
  };

  const downloadPdfForBook = (bookTitle: string, orderId: string) => {
    const bookObj = books.find(b => b.title === bookTitle) || {
      title: bookTitle,
      author: 'Amaechi Ubadike',
      subtitle: 'Aviation Safety Summit 2026 Publication',
      description: 'Official commemorative publication by DomisLink International Services Ltd.',
      tableOfContents: ['1. Executive Summary', '2. Airspace Command & Control', '3. Regulatory Compliance & Audits', '4. Conclusion & Recommendations'],
      previewSample: 'Safety is not just the job of one person, company, or government agency. It is a shared responsibility...'
    };

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primaryColor = [10, 25, 47];
    const goldColor = [212, 175, 55];

    doc.setFillColor(252, 251, 247);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, 15, 180, 42, 'F');
    doc.setLineWidth(0.6);
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(15, 15, 180, 42, 'S');

    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DOMISLINK INTERNATIONAL SERVICES LTD', 22, 23);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text('OFFICIAL DIGITAL PUBLICATION & AUTHOR EXCERPT (PDF)', 22, 33);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Ref: ${orderId} | Aviation Safety Summit 2026`, 22, 43);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(bookObj.title, 15, 68, { maxWidth: 180 });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(bookObj.subtitle, 15, 77, { maxWidth: 180 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Author: ${bookObj.author}`, 15, 86);

    doc.setLineWidth(0.3);
    doc.line(15, 91, 195, 91);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Synopsis & Overview', 15, 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const splitDesc = doc.splitTextToSize(bookObj.description, 180);
    doc.text(splitDesc, 15, 107);

    let yPos = 107 + (splitDesc.length * 4.5) + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Table of Contents', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    bookObj.tableOfContents.forEach((item, idx) => {
      doc.text(`• ${item}`, 20, yPos + (idx * 4.5));
    });

    yPos += (bookObj.tableOfContents.length * 4.5) + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Author Preview & Excerpt Edition', 15, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const splitSample = doc.splitTextToSize(`"${bookObj.previewSample}"`, 180);
    doc.text(splitSample, 15, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Published for Aviation Safety Summit 2026. All rights reserved.', 15, 285);

    doc.save(`${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_edition.pdf`);
  };

  const downloadEpubForBook = (bookTitle: string, orderId: string) => {
    const bookObj = books.find(b => b.title === bookTitle) || {
      title: bookTitle,
      author: 'Amaechi Ubadike',
      subtitle: 'Aviation Safety Summit 2026 Publication',
      description: 'Official commemorative publication by DomisLink International Services Ltd.',
      tableOfContents: ['1. Executive Summary', '2. Airspace Command & Control', '3. Regulatory Compliance & Audits', '4. Conclusion & Recommendations'],
      previewSample: 'Safety is not just the job of one person, company, or government agency. It is a shared responsibility...'
    };

    const xhtmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${bookObj.title}</title>
  <style>
    body { font-family: Georgia, serif; margin: 40px; color: #111; line-height: 1.6; background: #FCFBF7; }
    h1 { color: #0A192F; font-size: 26px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
    h2 { color: #555; font-size: 16px; font-style: italic; }
    .author { font-weight: bold; color: #D4AF37; margin-bottom: 20px; }
    .toc { background: #f4f0e6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .sample { font-style: italic; border-left: 4px solid #D4AF37; padding-left: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${bookObj.title}</h1>
  <h2>${bookObj.subtitle || ''}</h2>
  <div class="author">Authored by ${bookObj.author}</div>
  <hr/>
  <h3>Digital Publication Summary &amp; Excerpt Edition</h3>
  <p>${bookObj.description}</p>
  
  <div class="toc">
    <h3>Table of Contents</h3>
    <ul>
      ${bookObj.tableOfContents.map(t => `<li>${t}</li>`).join('')}
    </ul>
  </div>

  <h3>Author Preview &amp; Excerpt</h3>
  <div class="sample">
    "${bookObj.previewSample}"
  </div>

  <hr/>
  <p style="text-align: center; font-size: 11px; color: #777;">
    Official EPUB Digital Edition for Aviation Safety Summit 2026 by DomisLink International Services Ltd.<br/>
    Order Reference: ${orderId}
  </p>
</body>
</html>`;

    const blob = new Blob([xhtmlContent], { type: 'application/epub+zip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatBadge = (fmt: string) => {
    switch (fmt) {
      case 'SOFT_COPY': return { label: 'Soft Copy (PDF)', icon: Smartphone, color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'HARD_COPY': return { label: 'Hard Copy (Print)', icon: Printer, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'EBOOK': return { label: 'E-Book', icon: BookOpen, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'SPEAKER_HANDBOOK': return { label: 'Speaker Handbook', icon: Award, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default: return { label: 'Summit Publication', icon: FileText, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  return (
    <section id="domislink-bookstore" className="py-24 bg-[#0A192F] text-white relative overflow-hidden border-t border-[#D4AF37]/30">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:28px_28px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-mono tracking-widest uppercase">
            <BookOpen className="h-3.5 w-3.5" />
            <span>DomisLink Bookstore & Knowledge Library</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight uppercase">
            Permanent Aviation Literature
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
          <p className="text-sm sm:text-base text-[#8A99AD] font-light leading-relaxed">
            Turning the Aviation Safety Summit 2026 into a living knowledge repository. Explore peer-reviewed books, speaker handbooks, and regulatory publications.
          </p>
        </div>

        {/* Success Modal / Order Confirmation */}
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#071324] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white uppercase">Payment Verified &amp; Order Confirmed</h3>
                <p className="text-xs text-[#8A99AD] font-mono">Order Reference: {orderSuccess.orderId}</p>
              </div>

              <div className="bg-[#0A192F] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs">
                <p className="text-white font-semibold">{orderSuccess.bookTitle}</p>
                <p className="text-[#D4AF37] font-mono">Status: Confirmed &amp; Verified</p>
                <p className="text-emerald-300 font-medium">✓ Order registered in DomisLink secure digital ledger.</p>
                <p className="text-[#8A99AD] text-[11px]">Note: Email dispatch is simulated in this preview environment. Choose your preferred digital format below for instant download.</p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">Select Preferred Digital Format:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => downloadPdfForBook(orderSuccess.bookTitle, orderSuccess.orderId)}
                    className="py-3 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex flex-col items-center justify-center space-y-1 shadow-md cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download eBook (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadEpubForBook(orderSuccess.bookTitle, orderSuccess.orderId)}
                    className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex flex-col items-center justify-center space-y-1 shadow-md cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Download EPUB</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOrderSuccess(null)}
                  className="w-full py-2.5 bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition cursor-pointer mt-2"
                >
                  Return to Bookstore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#071324] border border-[#D4AF37]/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">{previewBook.publisher}</span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">{previewBook.title}</h3>
                </div>
                <button type="button" onClick={() => setPreviewBook(null)} className="text-white/60 hover:text-white p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">Subtitle & Author</h4>
                  <p className="text-sm text-neutral-300 italic">{previewBook.subtitle}</p>
                  <p className="text-xs text-[#8A99AD] mt-1 font-semibold">Author: {previewBook.author}</p>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] mb-1">Description</h4>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">{previewBook.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] mb-2">Table of Contents</h4>
                  <ul className="space-y-1.5 bg-[#0A192F] p-4 rounded-xl border border-white/10 text-xs text-neutral-300 font-mono">
                    {previewBook.tableOfContents.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-[#D4AF37]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] mb-1">Sample Preview (Introduction)</h4>
                  <div className="bg-[#0A192F] p-4 rounded-xl border border-white/10 text-xs sm:text-sm text-neutral-300 italic leading-relaxed">
                    "{previewBook.previewSample}"
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewBook(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const b = previewBook;
                    setPreviewBook(null);
                    setCheckoutBook(b);
                  }}
                  className="px-6 py-2.5 bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center space-x-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Order Publication (₦4,500 / ₦9,000)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#071324] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="text-base font-bold font-serif uppercase">Secure Paystack Checkout</h3>
                </div>
                <button type="button" onClick={() => setCheckoutBook(null)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 bg-[#0A192F] p-4 rounded-xl border border-white/10">
                <h4 className="font-serif font-bold text-sm text-white">{checkoutBook.title}</h4>
                <p className="text-xs text-[#8A99AD]">{checkoutBook.author}</p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8A99AD] mb-1.5">Select Format & Fixed Pricing</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutFormat('SOFT_COPY')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        checkoutFormat === 'SOFT_COPY' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' : 'bg-[#0A192F] border-white/15 text-[#8A99AD]'
                      }`}
                    >
                      <span className="block text-xs font-bold">Soft Copy (Digital PDF)</span>
                      <span className="block text-sm font-mono text-[#D4AF37] mt-1">₦4,500</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutFormat('HARD_COPY')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        checkoutFormat === 'HARD_COPY' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' : 'bg-[#0A192F] border-white/15 text-[#8A99AD]'
                      }`}
                    >
                      <span className="block text-xs font-bold">Hard Copy (Printed)</span>
                      <span className="block text-sm font-mono text-[#D4AF37] mt-1">₦9,000</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">+ Delivery fee</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8A99AD] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Capt. John Doe"
                    className="w-full px-3.5 py-2 bg-[#0A192F] border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8A99AD] mb-1">Email Address (for instant digital delivery) *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="johndoe@airline.com"
                    className="w-full px-3.5 py-2 bg-[#0A192F] border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {checkoutFormat === 'HARD_COPY' && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#8A99AD] mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="Enter full delivery address in Lagos / Nigeria"
                      className="w-full px-3.5 py-2 bg-[#0A192F] border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-[#8A99AD]">
                    Total: <span className="text-[#D4AF37] font-bold font-mono text-base">₦{checkoutFormat === 'SOFT_COPY' ? '4,500' : '9,000'}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="px-6 py-3 bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? <Sparkles className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    <span>{isProcessingPayment ? 'Verifying Paystack...' : 'Pay with Paystack'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Purchased Library Modal */}
        {showLibraryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#071324] border border-[#D4AF37]/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="text-base font-bold font-serif uppercase">My Purchased Library & E-Book Downloads</h3>
                </div>
                <button type="button" onClick={() => setShowLibraryModal(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {purchasedBooks.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <BookOpen className="h-10 w-10 text-white/30 mx-auto" />
                  <p className="text-sm text-[#8A99AD]">No purchased publications found in your local session library.</p>
                  <p className="text-xs text-neutral-400">Order any publication above to instantly access your digital EPUB and simulated email receipt.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-[#8A99AD]">Here are all the publications you have ordered during this session. You can re-download your EPUB files at any time.</p>
                  <div className="space-y-3">
                    {purchasedBooks.map((order, idx) => (
                      <div key={idx} className="bg-[#0A192F] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{order.orderId} • {order.date}</span>
                          <h4 className="text-sm font-serif font-bold text-white">{order.bookTitle}</h4>
                          <p className="text-xs text-emerald-400 font-mono">Status: Confirmed &amp; Verified</p>
                          <p className="text-[11px] text-[#8A99AD]">Simulated Email Receipt sent to: {order.email}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => downloadPdfForBook(order.bookTitle, order.orderId)}
                            className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Download eBook (PDF)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadEpubForBook(order.bookTitle, order.orderId)}
                            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>Download EPUB</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLibraryModal(false)}
                  className="px-6 py-2.5 bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 cursor-pointer"
                >
                  Close Library
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Library Bar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowLibraryModal(true)}
            className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs font-mono font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Purchased Library ({purchasedBooks.length} Books)</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8A99AD]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search titles, authors, keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#071324] border border-[#D4AF37]/30 rounded-xl text-xs text-white placeholder-[#8A99AD] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Format Filter */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['ALL', 'SOFT_COPY', 'HARD_COPY', 'EBOOK', 'SUMMIT_PUBLICATION'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase transition cursor-pointer shrink-0 ${
                    selectedFormat === fmt ? 'bg-[#D4AF37] text-[#0A192F] font-bold' : 'bg-[#071324] text-[#8A99AD] hover:text-white border border-white/10'
                  }`}
                >
                  {fmt === 'ALL' ? 'All Formats' : fmt.replace('_', ' ')}
                </button>
              ))}
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id ? 'bg-[#D4AF37] text-[#0A192F] shadow-md' : 'bg-[#071324] text-[#8A99AD] hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookstore Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => {
            const badge = getFormatBadge(book.format);
            const FormatIcon = badge.icon;

            return (
              <div 
                key={book.id} 
                className="bg-[#071324] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl hover:border-[#D4AF37]/60 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.color}`}>
                      <FormatIcon className="h-3 w-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{book.category.replace('_', ' ')}</span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#D4AF37] transition line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#8A99AD] italic mt-1 line-clamp-1">{book.subtitle}</p>
                    <p className="text-xs text-neutral-300 font-semibold mt-2">{book.author}</p>
                    <p className="text-[11px] text-[#8A99AD]">{book.publisher}</p>
                  </div>

                  <p className="text-xs text-neutral-300 font-light leading-relaxed line-clamp-3">
                    {book.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#8A99AD] block">Soft / Hard Copy</span>
                      <span className="text-sm font-mono font-bold text-[#D4AF37]">₦4,500 / ₦9,000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewBook(book)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutBook(book)}
                    className="w-full py-3 bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 flex items-center justify-center space-x-2 transition cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Order / Buy Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
