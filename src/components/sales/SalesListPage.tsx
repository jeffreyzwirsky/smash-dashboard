import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesAPI, boxesAPI } from '../../services/api';
import { Plus } from 'lucide-react';

export const SalesListPage: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [saleData, setSaleData] = useState({ title: '', description: '', sale_type: 'SEALED', starting_price: 0, start_date: '', end_date: '', box_ids: [] as number[] });
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({ queryKey: ['sales'], queryFn: salesAPI.getAll });
  const { data: boxes } = useQuery({ queryKey: ['boxes'], queryFn: boxesAPI.getAll });
  
  const createMutation = useMutation({ mutationFn: salesAPI.create, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); setShowCreate(false); setSaleData({ title: '', description: '', sale_type: 'SEALED', starting_price: 0, start_date: '', end_date: '', box_ids: [] }); } });

  const finishedBoxes = boxes?.filter((b: any) => b.status === 'FINISHED') || [];

  if (isLoading) return <div className="flex items-center justify-center p-8">Loading sales...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold">Sales</h1><button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={20} />New Sale</button></div>

      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Sale</h2>
          <div className="space-y-4">
            <input placeholder="Title" value={saleData.title} onChange={(e) => setSaleData({...saleData, title: e.target.value})} className="input" />
            <textarea placeholder="Description" value={saleData.description} onChange={(e) => setSaleData({...saleData, description: e.target.value})} className="input" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <select value={saleData.sale_type} onChange={(e) => setSaleData({...saleData, sale_type: e.target.value})} className="input"><option value="SEALED">Sealed Bid</option><option value="OPEN">Open Auction</option></select>
              <input type="number" placeholder="Starting Price" value={saleData.starting_price} onChange={(e) => setSaleData({...saleData, starting_price: Number(e.target.value)})} className="input" />
              <input type="datetime-local" value={saleData.start_date} onChange={(e) => setSaleData({...saleData, start_date: e.target.value})} className="input" />
              <input type="datetime-local" value={saleData.end_date} onChange={(e) => setSaleData({...saleData, end_date: e.target.value})} className="input" />
            </div>
            <div><label className="block text-sm font-medium mb-2">Select Boxes ({finishedBoxes.length} available)</label>
              {finishedBoxes.length === 0 ? (
                <p className="text-gray-500 text-sm p-4 border rounded">No finished boxes available. Create and finalize boxes first.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">{finishedBoxes.map((box: any) => (<label key={box.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"><input type="checkbox" checked={saleData.box_ids.includes(box.id)} onChange={(e) => setSaleData({...saleData, box_ids: e.target.checked ? [...saleData.box_ids, box.id] : saleData.box_ids.filter(id => id !== box.id)})} /><span>{box.box_number} - {box.name}</span></label>))}</div>
              )}
            </div>
            <div className="flex gap-2"><button onClick={() => createMutation.mutate(saleData)} disabled={saleData.box_ids.length === 0} className="btn-primary disabled:opacity-50">Create</button><button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!sales || sales.length === 0 ? (
          <div className="col-span-2 text-center p-8 text-gray-500">No sales yet. Create your first sale!</div>
        ) : (
          sales.map((sale: any) => (
            <div key={sale.id} className="card"><h3 className="font-semibold text-lg">{sale.title}</h3><p className="text-sm text-gray-600 mt-2">{sale.description}</p><div className="flex justify-between mt-4 text-sm"><span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">{sale.status}</span><span className="text-gray-600">{sale.bid_count || 0} bids</span></div></div>
          ))
        )}
      </div>
    </div>
  );
};