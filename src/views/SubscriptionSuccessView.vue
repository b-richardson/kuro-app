<template>
  <div class="subscription-success">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check"></i>
        </div>
        <h1 class="success-title">Subscription Successful!</h1>
        <p class="success-message">
          Thank you for subscribing to Kuro Pro. You now have access to all
          premium features.
        </p>
        <p class="success-detail">
          Your subscription is now active and you can enjoy unlimited templates,
          priority support, and advanced customization tools.
        </p>
        <div class="success-actions">
          <router-link to="/" class="btn btn-primary btn-lg">
            <span>Go to Dashboard</span>
            <i class="icon-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// We'll enhance this later to update the user's subscription in the database
</script>

<style scoped>
.subscription-success {
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

.success-card {
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

.success-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(136, 102, 233, 0.2);
  border-color: var(--color-primary);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  color: white;
  font-size: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.success-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.success-message {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.success-detail {
  color: var(--color-text-light);
  margin-bottom: 2rem;
}

.success-actions {
  margin-top: 2rem;
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
</style>
