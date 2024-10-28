import styles from './styles.module.css';

export default function Spinner({ fullPage }: { fullPage?: boolean }) {
  return (
    <div
      role="status"
      className={fullPage ? 'spinner-container-full-page' : 'spinner-container'}
    >
      <div className={styles.spinner} />
    </div>
  );
}
