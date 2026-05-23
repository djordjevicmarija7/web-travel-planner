import { createContext, useContext } from "react";
import tripService from '../services/tripService';
import activityService from '../services/activityService';
import checklistService from '../services/checklistService';
import expenseService from '../services/expenseService';
import shareService from '../services/shareService';
import adminService from '../services/adminService';

const ServiceContext = createContext();

const services ={
    tripService,
    activityService,
    checklistService,
    expenseService,
    shareService,
    adminService,
};

export function ServiceProvider({children}){
    return (
        <ServiceContext.Provider value={services}>
            {children}
        </ServiceContext.Provider>
    );
}

export function useServices(){
    return useContext(ServiceContext);
}