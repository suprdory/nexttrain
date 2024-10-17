# import pandas as pd
from nredarwin.webservice import DarwinLdbSession
from fastapi import FastAPI
from mangum import Mangum
app = FastAPI()
handler = Mangum(app)
api_key = 'e1f1ce56-0abc-4e91-942f-efd84e9eb165'

@app.get("/{patharg1}")
async def hello(patharg1):
    return{"message":"PathArg1:"+patharg1}


@app.get("/board/{dep_crs}/{dest_crs}")
async def getboard(dep_crs, dest_crs):

    darwin_sesh = DarwinLdbSession(
        wsdl="https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx", api_key=api_key)

    board = darwin_sesh.get_station_board(dep_crs, destination_crs=dest_crs)

    service_dicts = []
    to_station = ''
    for service in board.train_services:
        deets = darwin_sesh.get_service_details(
            service.service_id).subsequent_calling_points
        sched_arr_at_dest = None
        est_arr_at_dest = None
        for deet in deets:
            if deet.crs == dest_crs:
                # print(deet.crs,deet.et,deet.at,deet.st)
                sched_arr_at_dest = deet.st
                est_arr_at_dest = deet.et
                to_station = deet.location_name
        final_destination = deets[-1].location_name

        nd = {'Dep': service.std,
              'Est': service.etd,
              'Arr': sched_arr_at_dest,
              'Stat': est_arr_at_dest,
              'Plat': service.platform,
              'Operator': service.operator_name,
              'Final': final_destination,
              }
        service_dicts.append(nd)
    # df = pd.DataFrame(service_dicts)
    # print(df)
    print(service_dicts)

    # board_dict = df.to_dict(orient='records')

    ret_dict = {}
    ret_dict['from_station'] = board.location_name
    ret_dict['to_station'] = to_station
    ret_dict['board'] = service_dicts

    print(ret_dict)
    return ret_dict
