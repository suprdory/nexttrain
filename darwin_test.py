# %%
from nredarwin.webservice import DarwinLdbSession
import pandas as pd
import json
from dotenv import dotenv_values

config = dotenv_values("api/.env") 
print('config=',config)
api_key=config['API_KEY']
darwin_sesh = DarwinLdbSession(wsdl="https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx", api_key=api_key)
#%%
# # %%
# board = darwin_sesh.get_station_board('MAN')
# board.location_name
# # 'Manchester Piccadilly'

# # %%
# board.train_services[1].destination_text
# # 'Rose Hill Marple'
# # %%
# service_id = board.train_services[0].service_id
# service = darwin_sesh.get_service_details(service_id)
# [cp.location_name for cp in service.subsequent_calling_points]
# [Gorton, Fairfield, Guide Bridge, Hyde Central, Woodley, Romiley, Rose Hill Marple]

dep_crs="DMK"
dest_crs="VIC"

board = darwin_sesh.get_station_board(dep_crs,destination_crs=dest_crs)
#%%



#%%
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

    nd={'Dep.':service.std,
        'Est.':service.etd,
        'Arr.':sched_arr_at_dest,
        'Est.':est_arr_at_dest,
        'Plat.':service.platform,
        'Operator':service.operator_name,}
    service_dicts.append(nd)
df=pd.DataFrame(service_dicts)
print(df)

board_dict=df.to_dict(orient='records')

ret_dict={}
ret_dict['from_station']=board.location_name
ret_dict['to_station']=to_station
ret_dict['board']=board_dict


print(ret_dict)

# %%
