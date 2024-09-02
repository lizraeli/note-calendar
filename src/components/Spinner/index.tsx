import styles from './styles.module.css';

export default function Spinner() {
  return (
    <div className="spinner-container">
      <div className={styles.spinner} />
    </div>
  );
}
