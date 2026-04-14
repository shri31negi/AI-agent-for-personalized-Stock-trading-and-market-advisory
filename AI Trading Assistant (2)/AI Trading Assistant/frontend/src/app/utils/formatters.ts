
export const getCurrencySymbol = (currency?: string, symbol?: string) => {
  if (currency?.toUpperCase() === 'USD') return '$';
  if (symbol && !symbol.toUpperCase().endsWith('.NS') && !symbol.toUpperCase().endsWith('.BO') && symbol.toUpperCase() !== 'RELIANCE.NS' && symbol.toUpperCase() !== 'TCS.NS' && symbol.toUpperCase() !== 'HDFCBANK.NS' && !symbol.includes('.')) {
    // If it clearly looks like a US stock and no currency specified, we might still want to use USD for it individually 
    // but the request said "amount written on dashboard in inr". 
    // Let's default to INR for everything unless USD is explicitly requested.
  }
  
  return '₹';
};

export const formatCurrency = (value: number, currency?: string, symbol?: string) => {
  const currencySymbol = getCurrencySymbol(currency, symbol);
  
  if (value >= 1e12) {
    return `${currencySymbol}${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e7 && currencySymbol === '₹') {
    return `₹${(value / 1e7).toFixed(2)}Cr`;
  } else if (value >= 1e5 && currencySymbol === '₹') {
    return `₹${(value / 1e5).toFixed(2)}L`;
  } else if (value >= 1e9) {
    return `${currencySymbol}${(value / 1e9).toFixed(2)}B`;
  }
  
  return `${currencySymbol}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

