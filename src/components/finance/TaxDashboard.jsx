import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateStripeTax } from '@/api/functions';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Percent, FileText } from 'lucide-react';

export default function TaxDashboard() {
  const [lineItems, setLineItems] = useState([
    { product_id: 'prod_snack_1', unit_amount: 250, quantity: 10, tax_code: 'txcd_99999999' },
    { product_id: 'prod_drink_1', unit_amount: 300, quantity: 5, tax_code: 'txcd_10101010' },
  ]);
  const [taxResult, setTaxResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    line1: '123 Fake St',
    city: 'Sydney',
    state: 'NSW',
    postal_code: '2000',
    country: 'AU',
  });

  const handleCalculateTax = async () => {
    setIsLoading(true);
    setTaxResult(null);
    try {
      const payload = {
        currency: 'aud',
        line_items: lineItems.map(item => ({
          amount: item.unit_amount * item.quantity,
          reference: item.product_id,
          tax_code: item.tax_code,
        })),
        customer_details: {
          address,
          address_source: 'shipping',
        },
      };

      const response = await calculateStripeTax(payload);
      setTaxResult(response.data);
      toast.success('Tax calculation successful!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to calculate tax.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };
  
  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };
  
  const addItem = () => setLineItems([...lineItems, { product_id: `new_${Date.now()}`, unit_amount: 0, quantity: 1, tax_code: 'txcd_99999999' }]);
  const removeItem = (index) => setLineItems(lineItems.filter((_, i) => i !== index));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5"/>
            Advanced Tax Calculator (Stripe Tax)
        </CardTitle>
        <CardDescription>
          Simulate and calculate complex taxes for different products and locations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Customer Address</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input placeholder="Address" value={address.line1} onChange={(e) => handleAddressChange('line1', e.target.value)} />
            <Input placeholder="City" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
            <Input placeholder="State" value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
            <Input placeholder="Postcode" value={address.postal_code} onChange={(e) => handleAddressChange('postal_code', e.target.value)} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Line Items</h3>
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input placeholder="Product ID" value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} />
                <Input type="number" placeholder="Price (cents)" value={item.unit_amount} onChange={(e) => handleItemChange(index, 'unit_amount', Number(e.target.value))} />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
                <Input placeholder="Tax Code" value={item.tax_code} onChange={(e) => handleItemChange(index, 'tax_code', e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="mt-2"><Plus className="w-4 h-4 mr-2"/>Add Item</Button>
        </div>
        
        <Button onClick={handleCalculateTax} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Calculate Tax
        </Button>
        
        {taxResult && (
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-5 h-5"/>Calculation Result</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><strong>Total:</strong> {(taxResult.amount_total / 100).toFixed(2)} {taxResult.currency.toUpperCase()}</div>
                <div><strong>Subtotal:</strong> {(taxResult.taxable_amount / 100).toFixed(2)}</div>
                <div><strong>Total Tax:</strong> {(taxResult.tax_amount_exclusive / 100).toFixed(2)}</div>
                <div><strong>Tax Rate:</strong> {(taxResult.tax_breakdown[0]?.tax_rate_details.percentage_decimal || 0).toFixed(2)}%</div>
            </div>
            <pre className="mt-4 p-4 bg-slate-50 rounded-md text-xs overflow-auto">
              {JSON.stringify(taxResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}