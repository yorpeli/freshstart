import React from 'react';
import { Target } from 'lucide-react';
import Card from '../../../ui/Card';

interface WorkstreamsEmptyProps {
  title?: string;
  description?: string;
}

const WorkstreamsEmpty: React.FC<WorkstreamsEmptyProps> = ({ 
  title = "No Workstreams Found",
  description = "Get started by creating your first workstream."
}) => (
  <Card className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <Target size={48} className="mx-auto" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Card>
);

export default WorkstreamsEmpty;