<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Welcome to Viet Flavor</h1>
        <p class="tagline">
          Bringing the rich flavors of Vietnam to your table, one bowl at a
          time.
        </p>
        <router-link to="/menu" class="btn-primary"
          >Explore Our Menu</router-link
        >
      </div>
      <div class="hero-image">
        <img
          src="@/assets/restaurant1.png"
          alt="Restaurant Interior"
        />
      </div>
    </section>
    <section class="about-section content-section">
      <h2>About Us</h2>
          <div class="about-content-wrapper">
        <div class="about-image">
          <img
            src="@/assets/pho1.png"
            alt="Delicious Vietnamese Dish"
          />
        </div>
        <div class="about-text">
          <p>
            Welcome to Viet Flavor – where the authentic traditions of
            Vietnamese cuisine are preserved and shared. We believe that every
            dish isn't just a combination of fresh ingredients, but a story of
            culture, family, and cherished childhood memories. <br />
            At Viet Flavor, we take pride in offering you rich, authentic
            Vietnamese dishes, prepared with the freshest, most carefully
            selected ingredients, and with the utmost dedication from our
            culinary team. From a steaming bowl of flavorful pho and refreshing
            spring rolls to familiar street food delights, each dish is a
            journey into the true essence of Vietnamese gastronomy. <br />
            Come and experience a meal at Viet Flavor that feels just like home,
            where you don't just enjoy the food, but also feel the love and
            connection to our homeland's cuisine.
          </p>
        </div>
      </div>
    </section>

    <section class="featured-products-section content-section">
      <h2>Our Featured Dishes</h2>
      <div v-if="isLoadingFeatured" class="loading-spinner">
        Loading featured dishes...
      </div>
      <div
        v-else-if="featuredProducts.length === 0"
        class="no-products-message"
      >
        No featured dishes available at the moment.
      </div>
      <div v-else class="featured-products-grid">
        <div
          v-for="product in featuredProducts"
          :key="product._id"
          class="product-card"
        >
          <img
            :src="getBackendImageUrl(product.image)"
            :alt="product.name"
            class="product-image"
          />
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <router-link :to="`/products/${product._id}`" class="btn-secondary"
            >View Details</router-link
          >
        </div>
      </div>
    </section>

    <section class="why-choose-section content-section">
      <h2>Why Choose Viet Flavor?</h2>
      <div class="why-choose-grid">
        <div class="why-choose-item">
          <i class="fas fa-star"></i>
          <h3>5-Star Quality</h3>
          <p>We use only the freshest, high-quality ingredients to ensure every dish is a masterpiece.</p>
        </div>
        <div class="why-choose-item">
          <i class="fas fa-truck"></i>
          <h3>Fast Delivery</h3>
          <p>Enjoy your favorite Vietnamese dishes delivered hot and fresh right to your doorstep.</p>
        </div>
        <div class="why-choose-item">
          <i class="fas fa-headset"></i>
          <h3>24/7 Service</h3>
          <p>Our team is always ready to serve you, ensuring a seamless dining experience.</p>
        </div>
        <div class="why-choose-item">
          <i class="fas fa-shield-alt"></i>
          <h3>Food Safety</h3>
          <p>We adhere to the strictest hygiene standards to guarantee safe and healthy meals.</p>
        </div>
        <div class="why-choose-item">
          <i class="fas fa-smile"></i>
          <h3>Customer Satisfaction</h3>
          <p>Your happiness is our priority. We strive to exceed your expectations with every order.</p>
        </div>
        <div class="why-choose-item">
          <i class="fas fa-leaf"></i>
          <h3>Fresh Ingredients</h3>
          <p>Sourced daily from local farms, our ingredients guarantee authentic and vibrant flavors.</p>
        </div>
      </div>
    </section>
  </div> 
</template>

<script>
import apiClient from "@/helpers/api";

export default {
  name: "HomePage",
  data() {
    return {
      featuredProducts: [],
      isLoadingFeatured: false,
    };
  },
  async created() {
    await this.fetchFeaturedProducts();
  },
  methods: {
    async fetchFeaturedProducts() {
      this.isLoadingFeatured = true;
      try {
        const response = await apiClient.get(
          "/products?isFeatured=true&limit=6"
        );
        this.featuredProducts = response.data.products;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        this.featuredProducts = [];
      } finally {
        this.isLoadingFeatured = false;
      }
    },
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace("/api", "");
      if (!imagePath || imagePath === "/uploads/placeholder.jpg") {
        return "https://via.placeholder.com/200x200/f0f0f0/cccccc?text=No+Image";
      }
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      return `${backendBaseUrl}${
        imagePath.startsWith("/") ? "" : "/"
      }${imagePath}`;
    },
  },
};
</script>

<style scoped>
.home-page {
  background-color: var(--bg-light);
  padding-bottom: 50px;
}

.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 60px 5%;
  background-color: #f8f8f8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.hero-content {
  flex: 1;
  text-align: left;
  max-width: 500px;
}

.hero-content h1 {
  font-size: 3.5em;
  color: var(--primary-color);
  margin-bottom: 15px;
  font-family: var(--font-family-heading);
  line-height: 1.1;
}

.hero-content .tagline {
  font-size: 1.5em;
  color: var(--light-text-color);
  margin-bottom: 30px;
  font-family: var(--font-family-body);
}

.btn-primary {
  display: inline-block;
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1em;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.hero-image {
  flex: 1;
  max-width: 600px;
  text-align: right;
}

.hero-image img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.content-section {
  padding: 60px 5%;
  text-align: center;
}

.content-section h2 {
  font-size: 2.5em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.about-section p {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1em;
  line-height: 1.6;
  color: var(--text-color);
}

.featured-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-name {
  font-size: 1.4em;
  color: var(--text-color);
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
}

.product-price {
  font-size: 1.2em;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 20px;
}

.btn-secondary {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: darken(#6c757d, 10%);
}

.loading-spinner,
.no-products-message {
  font-size: 1.2em;
  color: var(--light-text-color);
  margin-top: 20px;
}

.why-choose-section {
  padding: 60px 5%;
  text-align: center;
  background-color: #f8f8f8; 
}

.why-choose-section h2 {
  font-size: 2.5em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.why-choose-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.why-choose-item {
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.why-choose-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.why-choose-item i {
  font-size: 3em;
  color: var(--accent-color);
  margin-bottom: 20px;
}

.why-choose-item h3 {
  font-size: 1.5em;
  color: var(--text-color);
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
}

.why-choose-item p {
  font-size: 1em;
  color: var(--light-text-color);
  line-height: 1.6;
  margin-bottom: 0; 
}

@media (max-width: 768px) {
  .why-choose-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
  }

  .hero-image {
    text-align: center;
    margin-top: 30px;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-content h1 {
    font-size: 2.5em;
  }

  .hero-content .tagline {
    font-size: 1.2em;
  }

  .content-section {
    padding: 40px 5%;
  }

  .content-section h2 {
    font-size: 2em;
  }

  .featured-products-grid {
    grid-template-columns: 1fr;
  }
}
.about-content-wrapper {
  display: flex; 
  flex-direction: row; 
  align-items: center; 
  gap: 50px; 
  max-width: 1200px; 
  margin: 0 auto; 
  text-align: left; 
}

.about-image {
  flex: 1; 
  max-width: 500px; 
  border-radius: 10px; 
  overflow: hidden; 
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); 
}

.about-image img {
  width: 100%; 
  height: 350px; 
  object-fit: cover; 
  display: block; 
}

.about-text {
  flex: 1.2; 
}

.about-text p {
  font-size: 1.1em;
  line-height: 1.6;
  color: var(--text-color);
  margin: 0; 
}

@media (max-width: 768px) {
  .about-content-wrapper {
    flex-direction: column;
    text-align: center; 
  }

  .about-image {
    max-width: 100%; 
    margin-bottom: 30px; 
  }
}
</style>
