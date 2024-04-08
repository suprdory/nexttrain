# %%
from nredarwin.webservice import DarwinLdbSession
import pandas as pd
from dotenv import dotenv_values
config = dotenv_values(".env") 
print('config=',config)
api_key=config['API_KEY']
darwin_sesh = DarwinLdbSession(wsdl="https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx", api_key=api_key)

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

service_dicts=[]
for service in board.train_services:
    deets=darwin_sesh.get_service_details(service.service_id).subsequent_calling_points
    sched_arr_at_dest=None
    est_arr_at_dest=None
    for deet in deets:
        if deet.crs==dest_crs:
            # print(deet.crs,deet.et,deet.at,deet.st)
            sched_arr_at_dest=deet.st
            est_arr_at_dest=deet.et

    nd={'std':service.std,
        'etd':service.etd,
        'sta':sched_arr_at_dest,
        'eta':est_arr_at_dest,
        'platform':service.platform,}
    service_dicts.append(nd)
df=pd.DataFrame(service_dicts)
print(df)
json=df.to_json(orient='records')
json
# %%
