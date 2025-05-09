import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip } from '@mui/material';

interface ObjectThumbnailProps {
  objects: Array<{
    id: string;
    class_name: string;
    thumbnail_url: string;
    confidence: number;
  }>;
  selectedClasses: string[];
}

const ObjectThumbnails: React.FC<ObjectThumbnailProps> = ({ objects, selectedClasses }) => {
  // Filter objects by selected classes if any are selected
  const filteredObjects = selectedClasses.length > 0
    ? objects.filter(obj => selectedClasses.includes(obj.class_name))
    : objects;

  if (filteredObjects.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1">No objects found</Typography>
        {selectedClasses.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Try selecting different classes
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {filteredObjects.map((object) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={object.id}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{
                height: 140,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {object.thumbnail_url ? (
                <img
                  src={object.thumbnail_url}
                  alt={`${object.class_name} thumbnail`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No thumbnail available
                </Typography>
              )}
            </CardMedia>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={object.class_name} 
                  size="small" 
                  color="primary" 
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(object.confidence * 100)}% confidence
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ObjectThumbnails;