import React from 'react';

const Loading = () => {
  return (
    <div style={styles.container}>
      <div style={styles.loader}>
        <div style={styles.ring}></div>
        <div style={styles.ring}></div>
        <div style={styles.ring}></div>
      </div>
      <p style={styles.text}>PhD Research Portal</p>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '24px',
    background: 'var(--background)'
  },
  loader: {
    width: '60px',
    height: '60px',
    position: 'relative'
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '4px solid transparent',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--primary)'
  }
};

export default Loading;