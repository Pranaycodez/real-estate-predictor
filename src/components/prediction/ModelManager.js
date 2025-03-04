import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import modelStorageService from '../../services/ModelStorageService';

const ModelManager = ({ onModelSelected, selectedModelId }) => {
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModelId, setDeleteModelId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load saved models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const storedModels = await modelStorageService.getAllModels();
        setModels(storedModels || []);
        setError(null);
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load saved models. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleSelectModel = async (modelId) => {
    try {
      const modelData = await modelStorageService.getModelById(modelId);
      if (modelData && onModelSelected) {
        onModelSelected(modelData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error selecting model:', err);
      setError('Failed to load the selected model.');
    }
  };

  const confirmDeleteModel = (id, e) => {
    e.stopPropagation();
    setDeleteModelId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteModel = async () => {
    if (!deleteModelId) return;
    
    try {
      await modelStorageService.deleteModel(deleteModelId);
      setModels(models.filter(model => model.id !== deleteModelId));
      
      // If the deleted model was selected, notify parent
      if (selectedModelId === deleteModelId && onModelSelected) {
        onModelSelected(null);
      }
    } catch (err) {
      console.error('Error deleting model:', err);
      setError('Failed to delete the model.');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteModelId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-save me-2 text-primary"></i>
              Saved Models
            </h5>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-hdd me-2"></i>
              Manage Models
            </Button>
          </div>
          
          {selectedModelId ? (
            <div className="mt-3">
              <Badge bg="success" className="p-2">
                <i className="fas fa-check-circle me-1"></i>
                Using Saved Model
              </Badge>
              <p className="text-muted small mb-0 mt-2">
                A pre-trained model is currently being used for predictions. 
                View all models to change or retrain.
              </p>
            </div>
          ) : (
            <p className="text-muted small mb-0 mt-2">
              {models.length > 0 
                ? "You have saved models available. Select 'Manage Models' to use one for predictions."
                : "No saved models found. Train a model to save it for future use."}
            </p>
          )}
        </Card.Body>
      </Card>

      {/* Model Selection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-hdd me-2 text-primary"></i>
            Manage Saved Models
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading saved models...</p>
            </div>
          ) : models.length === 0 ? (
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              No saved models found. Train a model to save it for future use.
            </Alert>
          ) : (
            <ListGroup>
              {models.map(model => (
                <ListGroup.Item 
                  key={model.id} 
                  action 
                  active={selectedModelId === model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-bold">{model.name}</div>
                    <div className="small text-muted">
                      <span className="me-3">
                        <i className="fas fa-chart-line me-1"></i>
                        Accuracy: {(model.accuracy * 100).toFixed(1)}%
                      </span>
                      <span className="me-3">
                        <i className="fas fa-calendar-alt me-1"></i>
                        Created: {formatDate(model.created)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={(e) => confirmDeleteModel(model.id, e)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this saved model? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteModel}>
            Delete Model
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModelManager;
