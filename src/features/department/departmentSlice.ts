import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { DepartmentDetails } from "./type";

type DepartmentState = {
  departments: DepartmentDetails[];
};

const initialState: DepartmentState = {
  departments: [],
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments(state, action: PayloadAction<DepartmentDetails[]>) {
      state.departments = action.payload;
    },
  },
});

export const { setDepartments } = departmentSlice.actions;

export const selectDepartments = (state: RootState) => state.department.departments;

export const selectDepartmentFilterOptions = createSelector(
  [selectDepartments],
  (departments) =>
    departments.map((department) => ({
      label: department.name,
      value: department.id,
    })),
);

export const selectDepartmentOptionsWithSpecialties = createSelector(
  [selectDepartments],
  (departments) =>
    departments.map((department) => ({
      label: department.name,
      value: department.id,
      specialties: department.specialties?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    })),
);

export default departmentSlice.reducer;
