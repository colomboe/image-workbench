let _showToast: (msg: string, duration?: number) => void = () => {};
export function showToast(msg: string, duration?: number) { _showToast(msg, duration); }
export function setShowToast(fn: typeof _showToast) { _showToast = fn; }
