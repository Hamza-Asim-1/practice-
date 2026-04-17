import React from 'react';
import './OrderInvoice.css';

const OrderInvoice = ({ order }) => {
    if (!order) return null;

    const subtotal = order.items?.reduce((acc, curr) => acc + (Number(curr.priceAtTime) * curr.quantity), 0) || 0;
    const delivery = Number(order.deliveryFee) || 0;
    const total = Number(order.totalAmount) || 0;

    return (
        <div className="print-only-invoice">
            <div className="invoice-header">
                <div>
                    <h1 className="invoice-logo">TEZA</h1>
                    <p className="invoice-subtitle">Premium Independent Butchers</p>
                </div>
                <div className="invoice-meta">
                    <h2>INVOICE</h2>
                    <p><strong>Order #:</strong> {order.id?.split('-')[0].toUpperCase()}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                </div>
            </div>

            <div className="invoice-addresses">
                <div className="invoice-box">
                    <h3>Billed To:</h3>
                    <p>{order.customer?.email || 'Guest Customer'}</p>
                    <p>{order.customer?.phone || ''}</p>
                </div>
                <div className="invoice-box">
                    <h3>Shipped To:</h3>
                    <p>
                        {order.address?.line1}<br />
                        {order.address?.line2 && <>{order.address.line2}<br /></>}
                        {order.address?.postcode}
                    </p>
                </div>
            </div>

            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Options (Cut/Fat/Bone)</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((it) => (
                        <React.Fragment key={it.id}>
                            <tr>
                                <td>
                                    <strong>{it.product?.name || 'Unknown Item'}</strong>
                                    <br />
                                    ID: {it.product?.id?.split('-')[0]}
                                </td>
                                <td className="invoice-options">
                                    {it.cutType && <span>Cut: {it.cutType}</span>}
                                    {it.texture && <span>Texture: {it.texture}</span>}
                                    {it.bonePreference && <span>Bone: {it.bonePreference}</span>}
                                    {it.packingStyle && <span>Pack: {it.packingStyle}</span>}
                                </td>
                                <td>{it.quantity}</td>
                                <td>£{Number(it.priceAtTime).toFixed(2)}</td>
                                <td>£{(Number(it.priceAtTime) * it.quantity).toFixed(2)}</td>
                            </tr>
                            {it.specialNotes && (
                                <tr className="invoice-special-notes">
                                    <td colSpan="5">
                                        <div className="special-notes-box">
                                            <strong>Butcher's Instructions:</strong> {it.specialNotes}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div className="invoice-summary">
                <div className="invoice-notes">
                    <h4>Driver Instructions:</h4>
                    <p>{order.address?.deliveryInstructions || 'None provided.'}</p>
                </div>
                <div className="invoice-totals">
                    <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="totals-row">
                        <span>Delivery:</span>
                        <span>£{delivery.toFixed(2)}</span>
                    </div>
                    <div className="totals-row grand-total">
                        <span>Total Paid:</span>
                        <span>£{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="invoice-footer">
                <p>Thank you for choosing TEZA. For support, contact support@teza.com</p>
            </div>
        </div>
    );
};

export default OrderInvoice;
