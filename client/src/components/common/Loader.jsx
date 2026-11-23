import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', minHeight = '320px' }) => {
  return (
    <div className="ui-loader-container" style={{ minHeight }}>
      <div className="ui-loader-spinner" />
      <p className="ui-loader-text">{message}</p>
    </div>
  );
};

export default Loader;
