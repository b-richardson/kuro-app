<template>
  <div class="subscription-cancel">
    <div class="container">
      <div class="cancel-card">
        <div class="cancel-icon">
          <i class="fas fa-times"></i>
        </div>
        <h1 class="cancel-title">Subscription Cancelled</h1>
        <p class="cancel-message">Your subscription process was cancelled.</p>
        <p class="cancel-detail">
          No worries! You can try again whenever you're ready. Your account will
          continue with the free plan features.
        </p>
        <div class="cancel-actions">
          <router-link to="/pricing" class="btn btn-primary btn-lg">
            <span>Back to Pricing</span>
            <i class="icon-arrow-right"></i>
          </router-link>
          <router-link to="/dashboard" class="btn btn-outline btn-lg">
            <span>Go to Dashboard</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a simple cancellation page for subscription confirmation
</script>

<style scoped>
.subscription-cancel {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: var(--color-background);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cancel-card {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.cancel-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.cancel-icon {
  width: 80px;
  height: 80px;
  background: #6a727a;
  color: white;
  font-size: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.cancel-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.cancel-message {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.cancel-detail {
  color: var(--color-text-light);
  margin-bottom: 2rem;
}

.cancel-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  text-align: center;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.btn-primary {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(
    90deg,
    var(--color-primary-dark),
    var(--color-primary)
  );
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 102, 233, 0.3);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background: rgba(136, 102, 233, 0.1);
  transform: translateY(-2px);
}
</style>
