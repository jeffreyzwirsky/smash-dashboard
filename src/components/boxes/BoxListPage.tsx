import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { boxesAPI } from '../../services/api';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';

export const BoxListPage: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [boxNumber, setBoxNumber] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: boxes, isLoading, error, refetch } = useQuery({ 
    queryKey: ['boxes'], 
    queryFn: boxesAPI.getAll,
    retry: 1
  });
  
  const createMutation = useMutation({ 
    mutationFn: boxesAPI.create, 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['boxes'] }); 
      setShowCreate(false); 
      setBoxNumber(''); 
      setDescription(''); 
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to create box: ${errorMsg}`);
      console.error('Create box error:', error.response?.data);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading boxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="card max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h3 className="text-lg font-semibold">Failed to Load Boxes</h3>
          </div>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Boxes ({boxes?.length || 0})</h1>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={20} />Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />New Box
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Box</h2>
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            createMutation.mutate({ 
              box_number: boxNumber, 
              description: description,
              status: 'active',
              total_weight: "0.00"
            }); 
          }} className="space-y-4">
            <div>
              <label htmlFor="boxNumber" className="block text-sm font-medium text-gray-700 mb-1">Box Number</label>
              <input 
                id="boxNumber" 
                name="boxNumber" 
                placeholder="BOX-001, METAL-042, etc." 
                value={boxNumber} 
                onChange={(e) => setBoxNumber(e.target.value)} 
                className="input" 
                required 
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                id="description" 
                name="description" 
                placeholder="Box description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="input" 
                rows={2}
                required 
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? 'Creating...' : 'Create Box'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!boxes || !Array.isArray(boxes) || boxes.length === 0 ? (
          <div className="col-span-3 card text-center p-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No boxes yet</p>
            <p className="text-gray-500 mb-4">Create your first box to get started!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
              Create First Box
            </button>
          </div>
        ) : (
          boxes.map((box: any) => (
            <div 
              key={box.id} 
              onClick={() => navigate(`/boxes/${box.id}`)} 
              className="card cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-primary-700">{box.box_number}</h3>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase">
                  {box.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{box.description || 'No description'}</p>
              <div className="flex justify-between items-center text-sm pt-3 border-t">
                <div className="flex items-center gap-2 text-gray-500">
                  <span>⚖️ {box.total_weight || '0.00'} lbs</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>🔧 {box.part_count || 0} parts</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};