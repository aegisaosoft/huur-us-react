import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { huurApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportToExcel } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import './InvoiceDetails.css';

interface Company {
  id: string;
  name: string;
  stateId: string;
  createdBy: string;
  userId: string;
  hqToken: string;
  isActive: boolean;
}

interface Toll {
  id: string;
  amount: number;
  paymentStatus: number;
  licensePlate: string;
  state: string;
  tollId: number;
  bookingNumber: string;
  tollDate?: string;
  tollTime?: string;
  tollAuthority?: string;
}

interface Fee {
  id: string;
  amount: number;
  paymentStatus: number;
  feeType: number;
  bookingNumber: string;
  description?: string;
}

interface Violation {
  id: string;
  citation: string;
  amount: number;
  paymentStatus: number;
  feeType: number;
  bookingNumber: string;
  licensePlate: string;
  state: string;
}

interface InvoiceData {
  id: string;
  companyId: string;
  invoiceDate: string;
  status: number;
  totalAmount: number;
  number: string;
  tolls: Toll[];
  fees: Fee[];
  violations: Violation[];
}

const InvoiceDetails: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    tolls: false,
    fees: false,
    violations: false
  });

  // Check if user is admin or owner
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = user?.isAdmin ?? false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isOwner = user?.isOwner ?? false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const _canAccessAdminFeatures = isAdmin || isOwner;

  // Get invoiceId from URL params
  const invoiceId = searchParams.get('invoiceId');
  const companyIdFromUrl = searchParams.get('companyId');
  const companyNameFromUrl = searchParams.get('companyName');
  const dateFromUrl = searchParams.get('date');

  // Fetch active companies (always fetch to resolve company name)
  const { data: companiesData } = useQuery({
    queryKey: ['activeCompanies'],
    queryFn: huurApi.getActiveCompanies,
    enabled: true, // Always fetch to resolve company names
    retry: 1
  });

  // Initialize state from URL params
  useEffect(() => {
    if (companyIdFromUrl) {
      setSelectedCompanyId(companyIdFromUrl);
    }
    if (companyNameFromUrl) {
      setCompanyName(companyNameFromUrl);
    }
    if (dateFromUrl) {
      setSelectedDate(dateFromUrl);
    } else {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [companyIdFromUrl, companyNameFromUrl, dateFromUrl]);

  // Fetch invoice data
  const { data: invoiceData, isLoading, error, refetch } = useQuery<InvoiceData>({
    queryKey: ['invoice-details', invoiceId, selectedCompanyId, selectedDate],
    queryFn: async () => {
      // If we have an invoiceId, fetch that specific invoice with full details
      if (invoiceId) {
        const response = await huurApi.getInvoiceDetailsById(invoiceId);
        // The API response already matches our InvoiceData interface
        return response;
      }
      
      // Fallback: Fetch invoice by company and date
      const response = await huurApi.getInvoiceByCompany(selectedCompanyId, selectedDate);
      
      // Transform the response to match our InvoiceData interface
      // The API returns payments array, we need to separate into tolls and fees
      return {
        id: response.id || '',
        companyId: response.companyId || selectedCompanyId,
        invoiceDate: response.invoiceDate || selectedDate,
        status: response.status ?? 0,
        totalAmount: response.totalAmount || 0,
        tolls: response.tolls || [],
        fees: response.fees || []
      };
    },
    enabled: Boolean(invoiceId || selectedCompanyId),
    retry: 1
  });

  // Auto-set company name from companies data if not already set
  useEffect(() => {
    if (companiesData?.result && !companyName) {
      const companyIdToFind = invoiceData?.companyId || selectedCompanyId || companyIdFromUrl;
      if (companyIdToFind) {
        const company = companiesData.result.find((c: Company) => 
          c.id.toLowerCase() === companyIdToFind.toLowerCase()
        );
        if (company) {
          setCompanyName(company.name);
        }
      }
    }
  }, [companiesData, companyName, invoiceData, selectedCompanyId, companyIdFromUrl]);

  const toggleSection = (section: 'tolls' | 'fees' | 'violations') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to get company name
  const getCompanyName = (): string => {
    if (!invoiceData) return '';
    
    // First try to find company by invoice's companyId
    let company = companiesData?.result?.find((c: Company) => 
      c.id.toLowerCase() === invoiceData.companyId.toLowerCase()
    );
    
    // If not found, try by selectedCompanyId
    if (!company && selectedCompanyId) {
      company = companiesData?.result?.find((c: Company) => 
        c.id.toLowerCase() === selectedCompanyId.toLowerCase()
      );
    }
    
    if (company) {
      return `${company.name}${company.stateId ? ` (${company.stateId})` : ''}`;
    }
    
    // If company name from URL, use it
    if (companyName) {
      return companyName;
    }
    
    // Last resort: show "Loading..." if companies are still loading
    if (!companiesData) {
      return 'Loading...';
    }
    
    return 'Unknown Company';
  };

  const calculateTotal = (): number => {
    if (!invoiceData) return 0;
    const tollsTotal = invoiceData.tolls?.reduce((sum, toll) => sum + Number(toll.amount || 0), 0) || 0;
    const feesTotal = invoiceData.fees?.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) || 0;
    const violationsTotal = invoiceData.violations?.reduce((sum, violation) => sum + Number(violation.amount || 0), 0) || 0;
    return tollsTotal + feesTotal + violationsTotal;
  };

  const calculateTollsTotal = (): number => {
    if (!invoiceData?.tolls) return 0;
    return invoiceData.tolls.reduce((sum, toll) => sum + Number(toll.amount || 0), 0);
  };

  const calculateFeesTotal = (): number => {
    if (!invoiceData?.fees) return 0;
    return invoiceData.fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  };

  const calculateViolationsTotal = (): number => {
    if (!invoiceData?.violations) return 0;
    return invoiceData.violations.reduce((sum, violation) => sum + Number(violation.amount || 0), 0);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusLabel = (status: number): { label: string; className: string } => {
    const statuses: Record<number, { label: string; className: string }> = {
      0: { label: 'Paid', className: 'badge bg-success' },
      1: { label: 'Unpaid', className: 'badge bg-warning text-dark' },
      2: { label: 'Processing', className: 'badge bg-info' },
      3: { label: 'Failed', className: 'badge bg-danger' }
    };
    return statuses[status] || statuses[1];
  };

  const getInvoiceStatusLabel = (status: number): { label: string; className: string } => {
    const statuses: Record<number, { label: string; className: string }> = {
      0: { label: 'Done', className: 'badge bg-primary' },
      1: { label: 'New (finalized)', className: 'badge bg-warning text-dark' },
      2: { label: 'PaymentRequested', className: 'badge bg-info' },
      3: { label: 'Paid', className: 'badge bg-success' },
      4: { label: 'Failed', className: 'badge bg-danger' }
    };
    return statuses[status] || { label: 'Unknown', className: 'badge bg-secondary' };
  };

  const getFeeTypeLabel = (type: number): string => {
    const types: Record<number, string> = {
      0: 'Administrative',
      1: 'Late Payment',
      2: 'Processing',
      3: 'Service'
    };
    return types[type] || 'Unknown';
  };

  const handleBackToInvoice = () => {
    // Use the same mechanism as AllInvoices page - navigate with company ID and date
    const companyId = invoiceData?.companyId || selectedCompanyId || companyIdFromUrl;
    const date = invoiceData?.invoiceDate || selectedDate || dateFromUrl;
    
    if (companyId && date) {
      // Format the date to YYYY-MM-DD for the URL parameter (same as AllInvoices)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      navigate(`/invoice?companyId=${companyId}&date=${formattedDate}`);
    } else {
      // Fallback to invoice page without parameters
      navigate('/invoice');
    }
  };

  const handleExportExcel = () => {
    if (!invoiceData) {
      toast.error('No invoice data to export');
      return;
    }

    // Combine tolls, fees, and violations into a single export
    const exportData = [
      ...invoiceData.tolls.map(toll => ({
        Type: 'Toll',
        'License Plate': toll.licensePlate,
        State: toll.state,
        'Toll ID': toll.tollId,
        'Booking Number': toll.bookingNumber,
        Amount: toll.amount,
        'Payment Status': getPaymentStatusLabel(toll.paymentStatus).label
      })),
      ...invoiceData.fees.map(fee => ({
        Type: 'Fee',
        'Fee Type': getFeeTypeLabel(fee.feeType),
        'Booking Number': fee.bookingNumber,
        Amount: fee.amount,
        'Payment Status': getPaymentStatusLabel(fee.paymentStatus).label
      })),
      ...invoiceData.violations.map(violation => ({
        Type: 'Violation',
        Citation: violation.citation,
        'License Plate': violation.licensePlate,
        State: violation.state,
        'Fee Type': getFeeTypeLabel(violation.feeType),
        'Booking Number': violation.bookingNumber,
        Amount: violation.amount,
        'Payment Status': getPaymentStatusLabel(violation.paymentStatus).label
      }))
    ];

    const success = exportToExcel(
      exportData,
      `Invoice_Details_${invoiceData.number || invoiceData.id}_${new Date().toISOString().slice(0,10)}`
    );

    if (success) {
      toast.success('Data exported to Excel successfully');
    } else {
      toast.error('Failed to export data to Excel');
    }
  };

  const handleExportPdf = async () => {
    if (!invoiceData) {
      toast.error('No invoice data to export');
      return;
    }

    try {
      const loadingToast = toast.loading('Generating PDF...');

      // Dynamically import jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (heightNeeded: number) => {
        if (yPosition + heightNeeded > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Calculate totals
      const tollsTotal = invoiceData.tolls?.reduce((sum, toll) => sum + Number(toll.amount || 0), 0) || 0;
      const feesTotal = invoiceData.fees?.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) || 0;
      const violationsTotal = invoiceData.violations?.reduce((sum, violation) => sum + Number(violation.amount || 0), 0) || 0;
      const totalAmount = tollsTotal + feesTotal + violationsTotal;

      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Invoice ${invoiceData.number || invoiceData.id}`, margin, yPosition);
      yPosition += 12;

      // Invoice Header Information
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Number:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.number || invoiceData.id.substring(0, 24), margin + 30, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Company:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(getCompanyName(), margin + 30, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Date:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(invoiceData.invoiceDate), margin + 30, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Status:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(getInvoiceStatusLabel(invoiceData.status).label, margin + 30, yPosition);
      yPosition += 10;

      // Total Amount
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, margin, yPosition);
      yPosition += 12;

      // Draw line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // TOLLS SECTION
      if (invoiceData.tolls && invoiceData.tolls.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Tolls (${invoiceData.tolls.length} items)`, margin, yPosition);
        pdf.setFontSize(12);
        pdf.text(`Subtotal: $${tollsTotal.toFixed(2)}`, pageWidth - margin - 40, yPosition);
        yPosition += 8;

        // Tolls Table Header
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const tollsHeaderY = yPosition;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, tollsHeaderY - 5, pageWidth - 2 * margin, 7, 'F');
        
        pdf.text('License Plate', margin + 2, tollsHeaderY);
        pdf.text('State', margin + 40, tollsHeaderY);
        pdf.text('Toll ID', margin + 60, tollsHeaderY);
        pdf.text('Booking #', margin + 80, tollsHeaderY);
        pdf.text('Amount', margin + 120, tollsHeaderY);
        pdf.text('Status', margin + 145, tollsHeaderY);
        yPosition += 5;

        // Tolls Data
        pdf.setFont('helvetica', 'normal');
        invoiceData.tolls.forEach((toll, index) => {
          checkPageBreak(8);
          
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, 'F');
          }
          
          pdf.text(toll.licensePlate || '-', margin + 2, yPosition);
          pdf.text(toll.state || '-', margin + 40, yPosition);
          pdf.text(String(toll.tollId || '-'), margin + 60, yPosition);
          pdf.text((toll.bookingNumber || '-').substring(0, 15), margin + 80, yPosition);
          pdf.text(`$${toll.amount.toFixed(2)}`, margin + 120, yPosition);
          pdf.text(getPaymentStatusLabel(toll.paymentStatus).label, margin + 145, yPosition);
          yPosition += 7;
        });

        yPosition += 8;
        checkPageBreak(20);
      }

      // VIOLATIONS SECTION
      if (invoiceData.violations && invoiceData.violations.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Violations (${invoiceData.violations.length} items)`, margin, yPosition);
        pdf.setFontSize(12);
        pdf.text(`Subtotal: $${violationsTotal.toFixed(2)}`, pageWidth - margin - 40, yPosition);
        yPosition += 8;

        // Violations Table Header
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const violationsHeaderY = yPosition;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, violationsHeaderY - 5, pageWidth - 2 * margin, 7, 'F');
        
        pdf.text('Citation', margin + 2, violationsHeaderY);
        pdf.text('License Plate', margin + 40, violationsHeaderY);
        pdf.text('State', margin + 80, violationsHeaderY);
        pdf.text('Booking #', margin + 100, violationsHeaderY);
        pdf.text('Amount', margin + 130, violationsHeaderY);
        pdf.text('Status', margin + 155, violationsHeaderY);
        yPosition += 5;

        // Violations Data
        pdf.setFont('helvetica', 'normal');
        invoiceData.violations.forEach((violation, index) => {
          checkPageBreak(8);
          
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, 'F');
          }
          
          pdf.text(violation.citation || '-', margin + 2, yPosition);
          pdf.text(violation.licensePlate || '-', margin + 40, yPosition);
          pdf.text(violation.state || '-', margin + 80, yPosition);
          pdf.text((violation.bookingNumber || '-').substring(0, 12), margin + 100, yPosition);
          pdf.text(`$${violation.amount.toFixed(2)}`, margin + 130, yPosition);
          pdf.text(getPaymentStatusLabel(violation.paymentStatus).label, margin + 155, yPosition);
          yPosition += 7;
        });

        yPosition += 8;
        checkPageBreak(20);
      }

      // FEES SECTION
      if (invoiceData.fees && invoiceData.fees.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Fees (${invoiceData.fees.length} items)`, margin, yPosition);
        pdf.setFontSize(12);
        pdf.text(`Subtotal: $${feesTotal.toFixed(2)}`, pageWidth - margin - 40, yPosition);
        yPosition += 8;

        // Fees Table Header
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const feesHeaderY = yPosition;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, feesHeaderY - 5, pageWidth - 2 * margin, 7, 'F');
        
        pdf.text('Fee Type', margin + 2, feesHeaderY);
        pdf.text('Booking Number', margin + 60, feesHeaderY);
        pdf.text('Amount', margin + 120, feesHeaderY);
        pdf.text('Payment Status', margin + 145, feesHeaderY);
        yPosition += 5;

        // Fees Data
        pdf.setFont('helvetica', 'normal');
        invoiceData.fees.forEach((fee, index) => {
          checkPageBreak(8);
          
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, 'F');
          }
          
          pdf.text(getFeeTypeLabel(fee.feeType), margin + 2, yPosition);
          pdf.text((fee.bookingNumber || '-').substring(0, 20), margin + 60, yPosition);
          pdf.text(`$${fee.amount.toFixed(2)}`, margin + 120, yPosition);
          pdf.text(getPaymentStatusLabel(fee.paymentStatus).label, margin + 145, yPosition);
          yPosition += 7;
        });
      }

      // Save PDF
      const fileName = `Invoice_${invoiceData.number || invoiceData.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Invoice</h4>
          <p>{error instanceof Error ? error.message : 'Failed to load invoice data'}</p>
          <button className="btn btn-primary" onClick={() => refetch()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <section className="authenticated-page">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">Invoice Details</h1>
          <div className="d-flex gap-2">
            {invoiceData && invoiceData.status === 0 && (
              <>
                <button className="btn btn-primary" style={{ height: '32px', padding: '4px 12px' }} onClick={handleExportExcel}>
                  Export to Excel
                </button>
                <button className="btn btn-primary" style={{ height: '32px', padding: '4px 12px' }} onClick={handleExportPdf}>
                  Export to PDF
                </button>
              </>
            )}
            <button className="btn btn-secondary" style={{ height: '32px', padding: '4px 12px' }} onClick={handleBackToInvoice}>
              ← Back to Invoice
            </button>
          </div>
        </div>

        {/* Invoice Content Container for PDF Export */}
        <div className="invoice-details-container">
          {/* Company Information */}
          {invoiceData && (
            <div className="mb-3">
              <p className="mb-0">
                <strong>Company:</strong>{' '}
                <span className="text-muted">{getCompanyName()}</span>
              </p>
            </div>
          )}

          {invoiceData && (
            <>
            {/* Invoice Header */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Invoice Number:</strong>{' '}
                      <span className="text-muted">{invoiceData.number || 'N/A'}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Company Name:</strong>{' '}
                      <span className="text-muted">{getCompanyName()}</span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Invoice Date:</strong>{' '}
                      <span className="text-muted">{formatDate(invoiceData.invoiceDate)}</span>
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <span className={getInvoiceStatusLabel(invoiceData.status).className}>
                        {getInvoiceStatusLabel(invoiceData.status).label}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-top">
                  <h3 className="mb-0">
                    <strong>Total Amount: </strong>
                    <span className="text-success">${calculateTotal().toFixed(2)}</span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Invoice Details Table */}
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '15%' }}>Type</th>
                        <th style={{ width: '35%' }}>Details</th>
                        <th style={{ width: '15%' }}>Booking Number</th>
                        <th style={{ width: '15%' }} className="text-end">Amount</th>
                        <th style={{ width: '20%' }}>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Tolls Section */}
                      <tr
                        className="table-primary cursor-pointer"
                        onClick={() => toggleSection('tolls')}
                        style={{ cursor: 'pointer' }}
                      >
                        <td colSpan={5}>
                          <div className="d-flex justify-content-between align-items-center py-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">
                                {expandedSections.tolls ? '▼' : '▶'} Tolls
                              </span>
                              <span className="text-muted small">
                                ({invoiceData.tolls?.length || 0} items)
                              </span>
                            </div>
                            <span className="fw-bold text-primary" style={{ fontSize: '16px' }}>
                              Subtotal: ${calculateTollsTotal().toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {expandedSections.tolls && invoiceData.tolls && invoiceData.tolls.map((toll) => {
                        const status = getPaymentStatusLabel(toll.paymentStatus);
                        return (
                          <tr key={toll.id}>
                            <td className="ps-4">
                              <span className="badge bg-info">Toll</span>
                            </td>
                            <td>
                              <div className="small">
                                <div><strong>License Plate:</strong> {toll.licensePlate}</div>
                                <div><strong>State:</strong> {toll.state}</div>
                                <div><strong>Toll ID:</strong> {toll.tollId}</div>
                                {toll.tollDate && (
                                  <div><strong>Date:</strong> {new Date(toll.tollDate).toLocaleDateString()}</div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="text-primary">{toll.bookingNumber || 'N/A'}</span>
                            </td>
                            <td className="text-end">
                              <strong>${toll.amount.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={status.className}>{status.label}</span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Violations Section */}
                      <tr
                        className="table-danger cursor-pointer"
                        onClick={() => toggleSection('violations')}
                        style={{ cursor: 'pointer' }}
                      >
                        <td colSpan={5}>
                          <div className="d-flex justify-content-between align-items-center py-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">
                                {expandedSections.violations ? '▼' : '▶'} Violations
                              </span>
                              <span className="text-muted small">
                                ({invoiceData.violations?.length || 0} items)
                              </span>
                            </div>
                            <span className="fw-bold text-danger" style={{ fontSize: '16px' }}>
                              Subtotal: ${calculateViolationsTotal().toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {expandedSections.violations && invoiceData.violations && invoiceData.violations.map((violation) => {
                        const status = getPaymentStatusLabel(violation.paymentStatus);
                        return (
                          <tr key={violation.id}>
                            <td className="ps-4">
                              <span className="badge bg-danger">Violation</span>
                            </td>
                            <td>
                              <div className="small">
                                <div><strong>Citation:</strong> {violation.citation}</div>
                                <div><strong>License Plate:</strong> {violation.licensePlate}</div>
                                <div><strong>State:</strong> {violation.state}</div>
                                <div><strong>Fee Type:</strong> {getFeeTypeLabel(violation.feeType)}</div>
                              </div>
                            </td>
                            <td>
                              <span className="text-primary">{violation.bookingNumber || 'N/A'}</span>
                            </td>
                            <td className="text-end">
                              <strong>${violation.amount.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={status.className}>{status.label}</span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Fees Section */}
                      <tr
                        className="table-success cursor-pointer"
                        onClick={() => toggleSection('fees')}
                        style={{ cursor: 'pointer' }}
                      >
                        <td colSpan={5}>
                          <div className="d-flex justify-content-between align-items-center py-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">
                                {expandedSections.fees ? '▼' : '▶'} Fees
                              </span>
                              <span className="text-muted small">
                                ({invoiceData.fees?.length || 0} items)
                              </span>
                            </div>
                            <span className="fw-bold text-success" style={{ fontSize: '16px' }}>
                              Subtotal: ${calculateFeesTotal().toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {expandedSections.fees && invoiceData.fees && invoiceData.fees.map((fee) => {
                        const status = getPaymentStatusLabel(fee.paymentStatus);
                        return (
                          <tr key={fee.id}>
                            <td className="ps-4">
                              <span className="badge bg-warning text-dark">Fee</span>
                            </td>
                            <td>
                              <div className="small">
                                <div><strong>Fee Type:</strong> {getFeeTypeLabel(fee.feeType)}</div>
                                {fee.description && (
                                  <div><strong>Description:</strong> {fee.description}</div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="text-primary">{fee.bookingNumber || 'N/A'}</span>
                            </td>
                            <td className="text-end">
                              <strong>${fee.amount.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={status.className}>{status.label}</span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Show message if no data */}
                      {(!invoiceData.tolls || invoiceData.tolls.length === 0) &&
                       (!invoiceData.fees || invoiceData.fees.length === 0) &&
                       (!invoiceData.violations || invoiceData.violations.length === 0) && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No invoice items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

          {!invoiceData && !isLoading && (
            <div className="alert alert-info">
              <p className="mb-0">Please select a company and date to view invoice details.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InvoiceDetails;

