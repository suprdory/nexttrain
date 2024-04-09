# import json
# from fastapi.encoders import jsonable_encoder
from nredarwin.webservice import DarwinLdbSession
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# import json
from dotenv import dotenv_values

config = dotenv_values(".env") 
print('config=',config)
api_key=config['API_KEY']
# print('api_key=',api_key)

# dep_crs="GTW"
# dest_crs="VIC"

app = FastAPI()

origins = [
    "https://suprdory.github.io",
    "http://127.0.0.1:5500",
    "https://suprdory.com",
    "https://www.suprdory.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/board/{dep_crs}/{dest_crs}")
async def getboard(dep_crs,dest_crs):

    darwin_sesh = DarwinLdbSession(wsdl="https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx", api_key=api_key)

    board = darwin_sesh.get_station_board(dep_crs,destination_crs=dest_crs)

    service_dicts=[]
    to_station=''
    for service in board.train_services:
        deets=darwin_sesh.get_service_details(service.service_id).subsequent_calling_points
        sched_arr_at_dest=None
        est_arr_at_dest=None
        for deet in deets:
            if deet.crs==dest_crs:
                # print(deet.crs,deet.et,deet.at,deet.st)
                sched_arr_at_dest=deet.st
                est_arr_at_dest=deet.et
                to_station=deet.location_name

        nd={'Dep':service.std,
            'Est':service.etd,
            'Arr':sched_arr_at_dest,
            'Stat':est_arr_at_dest,
            'Plat':service.platform,
            'Operator':service.operator_name,}
        service_dicts.append(nd)
    df=pd.DataFrame(service_dicts)
    print(df)
        # jsonstr=df.to_json(orient='records')
        # json_obj=json.loads(jsonstr)
        # print(json_obj)
        # # json={"message":"json test"}
        # return json_obj

    board_dict=df.to_dict(orient='records')

    ret_dict={}
    ret_dict['from_station']=board.location_name
    ret_dict['to_station']=to_station
    ret_dict['board']=board_dict

    print(ret_dict)
    return ret_dict