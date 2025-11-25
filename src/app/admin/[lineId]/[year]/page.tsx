"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Toast from '@/components/Toast';

interface YearData {
    id?: number;
    year: number;
    dt: number | null;
    ut: number | null;
    nva: number | null;
    kd: number | null;
    ke: number | null;
    ker: number | null;
    ksr: number | null;
    otr: number | null;
    tsr: string | null;
}

interface Product {
    id: number;
    name: string;
    image: string | null;
    yearData: YearData[];
}

export default function LineYearManagement() {
    const params = useParams();
    const lineId = params.lineId as string;
    const year = parseInt(params.year as string);

    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [lineName, setLineName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProductName, setNewProductName] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            // Fetch line name
            const lineRes = await fetch(`/api/lines/${lineId}`);
            if (lineRes.ok) {
                const lineData = await lineRes.json();
                setLineName(lineData.name);
            }

            const res = await fetch(`/api/products?lineId=${lineId}`);
            const data = await res.json();
            setAllProducts(data);
            // Filter to show only products that have data for this year
            const productsForYear = data.filter((p: Product) =>
                p.yearData.some(d => d.year === year)
            );
            setProducts(productsForYear);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    }, [lineId, year]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleAddProductToYear = async (productId: number) => {
        try {
            // Create empty year data for this product
            const res = await fetch('/api/year-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    year,
                    dt: null,
                    ut: null,
                    nva: null,
                    kd: null,
                    ke: null,
                    ker: null,
                    ksr: null,
                    otr: null,
                    tsr: null
                }),
            });

            if (res.ok) {
                showToast('Product added to this year!', 'success');
                setShowAddProduct(false);
                fetchProducts();
            } else {
                if (res.status === 403) {
                    showToast('Bu işlemi yapmaya yetkiniz yok!', 'error');
                } else {
                    throw new Error('Failed to add product');
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to add product to year', 'error');
        }
    };

    const handleCreateAndAddProduct = async () => {
        if (!newProductName.trim()) return;

        try {
            // 1. Create Product linked to Line
            const createRes = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProductName,
                    lineId: lineId
                }),
            });

            if (!createRes.ok) {
                if (createRes.status === 403) {
                    showToast('Bu işlemi yapmaya yetkiniz yok!', 'error');
                    return;
                }
                throw new Error('Failed to create product');
            }
            const newProduct = await createRes.json();

            // 2. Add Year Data
            await handleAddProductToYear(newProduct.id);
            setNewProductName('');
        } catch (error) {
            console.error(error);
            showToast('Failed to create and add product', 'error');
        }
    };

    const handleRemoveProductFromYear = async (productId: number) => {
        if (!confirm('Are you sure you want to remove this product from this year? This will delete all data for this year.')) {
            return;
        }

        try {
            const res = await fetch('/api/year-data/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, year }),
            });

            if (res.ok) {
                showToast('Product removed from this year!', 'success');
                fetchProducts();
            } else {
                if (res.status === 403) {
                    showToast('Bu işlemi yapmaya yetkiniz yok!', 'error');
                } else {
                    throw new Error('Failed to remove product');
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to remove product from year', 'error');
        }
    };

    const handleSave = async (productId: number, data: YearData) => {
        try {
            const res = await fetch('/api/year-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    ...data,
                    year // Ensure year overrides or is set correctly
                }),
            });

            if (res.ok) {
                showToast('Data saved successfully!', 'success');
                fetchProducts(); // Reload to ensure sync
            } else {
                if (res.status === 403) {
                    showToast('Bu işlemi yapmaya yetkiniz yok!', 'error');
                } else {
                    throw new Error('Failed to save');
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to save data', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <Link href={`/admin/${lineId}`} className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">← Back to Line</Link>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{year} Data Management</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddProduct(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2"
                    >
                        <span className="material-icons-outlined">add</span>
                        Add Product
                    </button>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition">
                        <span className="material-icons-outlined">upload_file</span>
                        Import CSV
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Security: Validate file type
                                const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
                                if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
                                    showToast('Invalid file type. Please upload a CSV file only.', 'error');
                                    e.target.value = '';
                                    return;
                                }

                                // Security: Validate file size (max 5MB)
                                const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                                if (file.size > MAX_FILE_SIZE) {
                                    showToast('File too large. Maximum size is 5MB.', 'error');
                                    e.target.value = '';
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    try {
                                        const text = event.target?.result as string;

                                        // Security: Check for suspiciously large content
                                        if (text.length > 10 * 1024 * 1024) { // 10MB
                                            showToast('File content too large.', 'error');
                                            e.target.value = '';
                                            return;
                                        }

                                        const lines = text.split('\n');
                                        const data = [];

                                        // Security: Limit number of rows
                                        if (lines.length > 101) { // Header + 100 rows
                                            showToast('Too many rows. Maximum 100 products per import.', 'error');
                                            e.target.value = '';
                                            return;
                                        }

                                        // Skip header (index 0)
                                        for (let i = 1; i < lines.length; i++) {
                                            const line = lines[i].trim();
                                            if (!line) continue;

                                            // Simple CSV split (using semicolon for Excel compatibility)
                                            const cols = line.split(';');

                                            if (cols.length < 10) {
                                                console.warn('Skipping line due to insufficient columns:', cols);
                                                continue;
                                            }

                                            const [productName, dt, ut, nva, kd, ke, ker, ksr, otr, tsr] = cols;

                                            // Clean up product name (remove quotes if any) with length limit
                                            const cleanName = productName.trim().replace(/^"|"$/g, '').substring(0, 255);

                                            // Helper to parse float and warn if invalid
                                            const parseNum = (val: string, fieldName: string, rowName: string) => {
                                                if (!val) return null;
                                                const num = parseFloat(val);
                                                if (isNaN(num)) {
                                                    console.warn(`Invalid number for ${fieldName} in ${rowName}: "${val}"`);
                                                    return null;
                                                }
                                                // Prevent extremely large numbers
                                                if (Math.abs(num) > 1e10) {
                                                    console.warn(`Number too large for ${fieldName} in ${rowName}`);
                                                    return null;
                                                }
                                                return num;
                                            };

                                            data.push({
                                                productName: cleanName,
                                                dt: parseNum(dt, 'DT', cleanName),
                                                ut: parseNum(ut, 'UT', cleanName),
                                                nva: parseNum(nva, 'NVA', cleanName),
                                                kd: parseNum(kd, 'KD', cleanName),
                                                ke: parseNum(ke, 'KE', cleanName),
                                                ker: parseNum(ker, 'KER', cleanName),
                                                ksr: parseNum(ksr, 'KSR', cleanName),
                                                otr: parseNum(otr, 'OT', cleanName),
                                                tsr: tsr ? tsr.trim().substring(0, 255) : null
                                            });
                                        }

                                        if (data.length > 0) {
                                            try {
                                                const res = await fetch('/api/year-data/bulk', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ year, data, lineId }) // Send lineId
                                                });

                                                const result = await res.json();
                                                if (res.ok) {
                                                    const message = result.errors
                                                        ? `Imported ${result.success} rows, ${result.failed} failed. Check console for details.`
                                                        : `Successfully imported ${result.success} rows!`;
                                                    showToast(message, result.errors ? 'error' : 'success');
                                                    if (result.errors) {
                                                        console.error('Import errors:', result.errors);
                                                    }
                                                    fetchProducts();
                                                } else {
                                                    console.error('Server Error:', result);
                                                    showToast(`Failed to import: ${result.error || 'Unknown error'}`, 'error');
                                                }
                                            } catch (err) {
                                                console.error('Fetch Error:', err);
                                                showToast('Error during import. Check console for details.', 'error');
                                            }
                                        } else {
                                            showToast('No valid data found in CSV. Check console for details.', 'error');
                                        }
                                    } catch (parseError) {
                                        console.error('CSV Parse Error:', parseError);
                                        showToast('Failed to parse CSV file. Please check the format.', 'error');
                                    }

                                    // Reset input
                                    e.target.value = '';
                                };
                                reader.readAsText(file);
                            }}
                        />
                    </label>
                    <button
                        onClick={() => {
                            // Simple CSV Export
                            const headers = ['Product', 'DT', 'UT', 'NVA', 'KD', 'KE', 'KER', 'KSR', 'OT', 'TSR'];
                            const rows = products.map(p => {
                                const d = p.yearData.find(yd => yd.year === year);
                                return [
                                    p.name,
                                    d?.dt ?? '', d?.ut ?? '', d?.nva ?? '', d?.kd ?? '', d?.ke ?? '', d?.ker ?? '', d?.ksr ?? '', d?.otr ?? '', d?.tsr ?? ''
                                ].join(';');
                            });
                            const csvContent = [headers.join(';'), ...rows].join('\n');
                            // Add BOM for Excel UTF-8 compatibility
                            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', `${lineName || 'Line'}_YearData_${year}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2"
                    >
                        <span className="material-icons-outlined">download</span>
                        Export CSV
                    </button>
                </div>
            </header>

            {/* Add Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add Product to {year}</h2>

                        {/* Create New Product */}
                        <div className="mb-6 border-b pb-6 border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Create New Product</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    placeholder="New Product Name"
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                />
                                <button
                                    onClick={handleCreateAndAddProduct}
                                    disabled={!newProductName.trim()}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Or Select Existing Product</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {allProducts
                                .filter(p => !p.yearData.some(d => d.year === year))
                                .map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleAddProductToYear(product.id)}
                                        className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        {product.name}
                                    </button>
                                ))}
                            {allProducts.filter(p => !p.yearData.some(d => d.year === year)).length === 0 && (
                                <p className="text-gray-500 text-center py-4">No other existing products found.</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAddProduct(false)}
                            className="mt-4 w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {products.map(product => {
                    const yearData = product.yearData.find(d => d.year === year) || {
                        year,
                        dt: null, ut: null, nva: null, kd: null, ke: null, ker: null, ksr: null, otr: null, tsr: null
                    };
                    const isExpanded = expandedProduct === product.id;

                    return (
                        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                            >
                                <span className="font-semibold text-lg text-gray-800 dark:text-white">{product.name}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveProductFromYear(product.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Remove from this year"
                                    >
                                        <span className="material-icons-outlined">delete</span>
                                    </button>
                                    <span className="material-icons-outlined text-gray-400">
                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                    <YearDataForm
                                        initialData={yearData}
                                        onSave={(data) => handleSave(product.id, data)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

function YearDataForm({ initialData, onSave }: { initialData: YearData, onSave: (data: YearData) => void }) {
    const [data, setData] = useState(initialData);

    const handleChange = (field: keyof YearData, value: string) => {
        if (field === 'tsr') {
            setData({ ...data, [field]: value });
        } else {
            const num = value === '' ? null : parseFloat(value);
            setData({ ...data, [field]: num });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b pb-1">Main Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['dt', 'ut', 'nva', 'kd', 'ke', 'ker', 'ksr', 'otr'].map((field) => (
                        <div key={field} className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{field}</label>
                            <input
                                type="number"
                                step="0.001"
                                value={data[field as keyof YearData] ?? ''}
                                onChange={(e) => handleChange(field as keyof YearData, e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    ))}
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">TSR</label>
                        <input
                            type="text"
                            value={data.tsr ?? ''}
                            onChange={(e) => handleChange('tsr', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-end">
                <button
                    onClick={() => onSave(data)}
                    className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition w-full md:w-auto"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
