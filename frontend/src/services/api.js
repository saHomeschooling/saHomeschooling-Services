import { providerData, featuredSlotsMock, reviewsMock, providersList } from '../utils/constants';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Provider methods
  getProviders: async () => {
    await delay(500);
    return { success: true, data: providersList };
  },
  
  getProviderById: async (id) => {
    await delay(300);
    const provider = providerData[id];
    if (provider) {
      return { success: true, data: provider };
    }
    return { success: false, error: 'Provider not found' };
  },
  
  updateProvider: async (id, data) => {
    await delay(700);
    console.log(`Updating provider ${id} with:`, data);
    // In a real app, this would save to database
    return { success: true, data: { id, ...data } };
  },
  
  approveProvider: async (id) => {
    await delay(400);
    console.log(`Approving provider ${id}`);
    return { success: true, data: { id, status: 'approved' } };
  },
  
  rejectProvider: async (id) => {
    await delay(400);
    console.log(`Rejecting provider ${id}`);
    return { success: true, data: { id, status: 'rejected' } };
  },
  
  // Featured slots methods
  getFeaturedSlots: async () => {
    await delay(300);
    return { success: true, data: featuredSlotsMock };
  },
  
  assignFeaturedSlot: async (slotId, providerId) => {
    await delay(400);
    console.log(`Assigning slot ${slotId} to provider ${providerId}`);
    return { success: true, data: { slotId, providerId } };
  },
  
  removeFeaturedSlot: async (slotId) => {
    await delay(300);
    console.log(`Removing provider from slot ${slotId}`);
    return { success: true, data: { slotId } };
  },
  
  rotateFeaturedSlot: async (slotId) => {
    await delay(400);
    console.log(`Rotating slot ${slotId}`);
    return { success: true, data: { slotId } };
  },
  
  // Reviews methods
  getReviews: async () => {
    await delay(300);
    return { success: true, data: reviewsMock };
  },
  
  moderateReview: async (reviewId, action) => {
    await delay(400);
    console.log(`${action}ing review ${reviewId}`);
    return { success: true, data: { reviewId, status: action === 'approve' ? 'approved' : 'rejected' } };
  },
  
  // Stats
  getStats: async () => {
    await delay(300);
    return {
      success: true,
      data: {
        totalProviders: 28,
        pendingApproval: 8,
        featuredSlots: 4,
        pendingReviews: 12
      }
    };
  }
};