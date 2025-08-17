import './LoadingSpinner.css';

/**
 * Loading spinner component that displays a rotating animation
 * @returns JSX element containing the loading spinner
 */
export default function LoadingSpinner() {
    return(
        <div className="spinner_container">
            <div className="spinner"></div>
        </div>
    );
}