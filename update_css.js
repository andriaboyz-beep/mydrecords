const fs = require('fs');
let css = fs.readFileSync('/var/www/mydrecords/src/index.css', 'utf-8');

// Update form wizard styling in index.css
css = css.replace(/\/\* --- FORM WIZARD \(KONTRAK BARU\) ---\ \*\/([\s\S]*?)\/\* --- FORM ROW & GROUPS --- \*\//, `/* --- FORM WIZARD (KONTRAK BARU) --- */
.wizard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.wizard-header-title h2 {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
}

.wizard-header-title p {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.wizard-header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.horizontal-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  border-bottom: 1px solid #e2e8f0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.step-item.active {
  opacity: 0.7;
}

.step-item.active-current {
  opacity: 1;
  transform: scale(1.05);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(129, 140, 248, 0.4);
}

.step-item.active-current .step-number {
  background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.4);
  border: 2px solid white;
}

.step-text {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.step-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.step-divider {
  height: 2px;
  width: 60px;
  background-color: #e2e8f0;
  margin: 0 1rem;
  border-radius: 2px;
}

.wizard-body {
  display: flex;
  flex: 1;
  padding: 3rem 4rem;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.wizard-form-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  transition: transform 0.3s, box-shadow 0.3s;
}

.form-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.form-section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #e2e8f0;
}

.form-section-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.form-section-header p {
  color: #64748b;
  font-size: 0.9rem;
}

.party-box {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.party-box:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.party-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #4f46e5;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
/* --- FORM ROW & GROUPS --- */`);

fs.writeFileSync('/var/www/mydrecords/src/index.css', css);
console.log("CSS Updated successfully");
