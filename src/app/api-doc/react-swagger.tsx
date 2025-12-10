'use client';

import { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: object;
};

function ReactSwagger({ spec }: Props) {
  useEffect(() => {
    // Suppress React strict mode warnings from swagger-ui-react
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('UNSAFE_componentWillReceiveProps')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <SwaggerUI 
      spec={spec} 
      tryItOutEnabled={true}
      docExpansion="list"
      persistAuthorization={true}
    />
  );
}

export default ReactSwagger;