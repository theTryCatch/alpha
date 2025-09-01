This is about customer raising cancellation and pushouts on an order with an organication called contoso. 

Customer can connect with the Sales person/ team with whom he was in touch with asking them about the cancellation or pushout. Or they can connect with the Customer Service team for the same.


If request is raised to Sales owner then it is expected that the sales team to intimate to the customer service team. Then the customer service team will validate the cancellation/ pushout request based on the custer service agreement and terms (CSA Terms)then they forward this information to Sales team. 


Then Sales team shall connect with the customer for negoctions; once they are done then they will again communicate to the customer service team with their decision.
If it is approved by the sales team then customer service team will update the oracle systems by marking the order on hold if it is denied customer service team will communicate the decision to customer. Then automatically the oracle system updates will be picked by the system called Rapid Response team which proecss it's logics and prepares workbooks with in it's system. 

GCOps team periodically checks for the Rapid Responce updates and prepares for their process. Their process starts by downloading 4 files from the Rapid Responce application. 1. cancellation/ push out file, 2. Customer, OEM details, 3. CSA terms and 4. Contoso calendar. They will download these to a shared drive and then runs PowerQuery on top this. PowerQuey emits a file as an output. Which contains two workbooks in it named Cancellation, Pushouts. After this, GCOps validates the emitted file by the PowerQuery against the CSA Terms and then commuincate to the BU Finances with their findiing and recommendations. 

BU finance will run their processes on the request and shall approve or deny the customer request. They will update the same excel file and gives back to the GCOps. GCOps will updates the BU Finance provided decision in the Rapid Responce application. These changes are being monitors by the Customer Service team. They will pick up the changes from the Rapid Responce application and updates the relevant records again in the Oracle systems and communicates to the user.
