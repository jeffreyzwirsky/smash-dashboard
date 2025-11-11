import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boxesAPI, partsAPI } from '../../services/api';
import { ArrowLeft, Plus, Upload, Trash2, Save } from 'lucide-react';

export const BoxDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddPart, setShowAddPart] = useState(false);
  const [partData, setPartData] = useState({ 
    material_type: 'STEEL', 
    part_type: '', 
    weight: 0, 
    condition: 'USED',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState('');
  const [totalWeight, setTotalWeight] = useState('');

  const { data: box, isLoading } = useQuery({ 
    queryKey: ['box', id], 
    queryFn: () => boxesAPI.getById(Number(id))
  });

  useEffect(() => {
    if (box) {
      setDescription((box as any).description || '');
      setTotalWeight((box as any).total_weight || '0.00');
    }
  }, [box]);
  
  const updateMutation = useMutation({ 
    mutationFn: (data: any) => boxesAPI.update(Number(id), data), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['box', id] });
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
      setEditMode(false);
    }
  });
  
  const addPartMutation = useMutation({ 
    mutationFn: partsAPI.create, 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['box', id] }); 
      setShowAddPart(false); 
      setPartData({ material_type: 'STEEL', part_type: '', weight: 0, condition: 'USED', description: '' }); 
    } 
  });
  
  const deletePartMutation = useMutation({ 
    mutationFn: partsAPI.delete, 
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['box', id] }) 
  });

  const handlePhotoUpload = async (photoField: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append(photoField, file);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://99.79.46.88/api/v1/boxes/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['box', id] });
        alert('Photo uploaded successfully!');
      } else {
        alert('Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-8">Loading...</div>;
  if (!box) return <div>Box not found</div>;

  const boxData = box as any;

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => navigate('/boxes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Boxes
      </button>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-700">{boxData.box_number}</h1>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold uppercase">
              {boxData.status}
            </span>
          </div>
          <button 
            onClick={() => setEditMode(!editMode)} 
            className={editMode ? "btn-secondary" : "btn-primary"}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="input" 
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Weight (lbs)</label>
              <input 
                type="number" 
                step="0.01"
                value={totalWeight} 
                onChange={(e) => setTotalWeight(e.target.value)} 
                className="input" 
              />
            </div>
            <button 
              onClick={() => updateMutation.mutate({ description, total_weight: totalWeight })} 
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Description:</span>
              <p className="text-gray-800">{boxData.description || 'No description'}</p>
            </div>
            <div className="flex gap-6 text-lg">
              <div>
                <span className="text-sm text-gray-500">Total Weight:</span>
                <p className="font-semibold">{boxData.total_weight || '0.00'} lbs</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Parts:</span>
                <p className="font-semibold">{boxData.part_count || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Box Photos (8 max)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5', 'photo_6', 'photo_7', 'photo_8'].map((field, idx) => (
            <div key={field} className="relative">
              <label className="block text-sm font-medium mb-1">Photo {idx + 1}</label>
              <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary-500 transition-colors">
                {boxData[field] ? (
                  <img src={boxData[field]} alt={`Box ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(field, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Parts ({boxData.part_count || 0})</h2>
          <button onClick={() => setShowAddPart(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />Add Part
          </button>
        </div>
        
        {showAddPart && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">Add New Part</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Material Type</label>
                <select value={partData.material_type} onChange={(e) => setPartData({...partData, material_type: e.target.value})} className="input">
                  <option>IRON</option>
                  <option>STEEL</option>
                  <option>ALUMINUM</option>
                  <option>COPPER</option>
                  <option>BRASS</option>
                  <option>STAINLESS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Part Type</label>
                <input placeholder="e.g. Engine Block" value={partData.part_type} onChange={(e) => setPartData({...partData, part_type: e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
                <input type="number" step="0.01" placeholder="0.00" value={partData.weight} onChange={(e) => setPartData({...partData, weight: Number(e.target.value)})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select value={partData.condition} onChange={(e) => setPartData({...partData, condition: e.target.value})} className="input">
                  <option>NEW</option>
                  <option>USED</option>
                  <option>DAMAGED</option>
                  <option>SCRAP</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea value={partData.description} onChange={(e) => setPartData({...partData, description: e.target.value})} className="input" rows={2} placeholder="Additional details..."/>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addPartMutation.mutate({...partData, box: Number(id)})} className="btn-primary">Add Part</button>
              <button onClick={() => setShowAddPart(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!boxData.parts || boxData.parts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No parts yet. Add your first part!</p>
          ) : (
            boxData.parts.map((part: any) => (
              <div key={part.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-lg">{part.material_type}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-700">{part.part_type}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>⚖️ {part.weight} lbs</span>
                    <span>📋 {part.condition}</span>
                  </div>
                  {part.description && <p className="text-sm text-gray-500 mt-1">{part.description}</p>}
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Delete this part?')) {
                      deletePartMutation.mutate(part.id);
                    }
                  }} 
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};