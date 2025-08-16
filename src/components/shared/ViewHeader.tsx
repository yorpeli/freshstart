interface ViewHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ 
  title, 
  description, 
  action,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default ViewHeader;