'use client'; 

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: object;
};

function ReactSwagger({ spec }: Props) {
  return (
    <SwaggerUI 
      spec={spec} 
      tryItOutEnabled={true}
      docExpansion="list" // Controls how endpoints are expanded (e.g., 'none', 'list', 'full')
    />
  );
}

export default ReactSwagger;