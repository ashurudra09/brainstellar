import { useContext } from 'react';
import { ProgressContext } from '../contexts/ProgressContext';

const useProgress = () => useContext(ProgressContext);

export default useProgress;
