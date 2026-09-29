import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSearchResults = createAsyncThunk(
  'search/fetchResults',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/search', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search query failed.');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    type: 'All',
    region: 'All',
    domain: 'All',
    year: 'All',
    station: 'All',
    expedition: 'All',
    results: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetFilters: (state) => {
      state.query = '';
      state.type = 'All';
      state.region = 'All';
      state.domain = 'All';
      state.year = 'All';
      state.station = 'All';
      state.expedition = 'All';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setQuery, setFilters, resetFilters } = searchSlice.actions;
export default searchSlice.reducer;
