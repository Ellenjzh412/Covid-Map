import axios from "axios";

export const CovidDatService = {
    getAllCountyCases: function(){
        return axios.get("https://disease.sh/v3/covid-19/jhucsse/counties");
    }
}

