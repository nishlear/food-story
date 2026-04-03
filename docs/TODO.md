## Important

1. Define 3 actors: **(DONE)**
- The user: only have access to opening food street, seeing food vendors
- Food Vendor Owner: able to request creating a new food vendor in a food street.
- Admin: admin stuff with dashboard and stuff

1.1. Accounts **(DONE)**
- User: user:123123
- Food Vendor: foodvendor:123123
- Admin: admin:123123

-> The task is **define role permission**.

2. Defining a map
- For every street food, there should be a custom hand-drawn map of that place. However i am unable to define the map resolution or how to convert from long-lat to position on the hand-drawn map.
- Possible idea: georeferencing.

## Less important 

1. Refactor **(DONE)**
- Refactor code for easily scalability and easy to fix. **Only start to implement this if the codebase is getting messy and hard to navigate**.

2. As admin:
- I want to edit the vendors' information like the "About", vendors' name, star rating

3. As User:
- I want to rate a vendor from 1 to 5 star, by having a "Rate Vendor" section inbetween the "About" and "Recent Comments" section.

## User:
- Able to comment, Rate star rating
- Create new account/change account password by typing old password, new password & new password again

## Admin:
- Create admin page: dashboard, manage users, manage vendors and their store, manage comments, manage food streets.
- Add additional way to manage from the admin page, not just limited by the current way. 

### Comments
1. Comments should be filtered by vendor/street. Like we navigate to a street -> vendor -> then seeing the comments. 

## Vendors:
- Only update their OWN vendor (assigned by admin), can change vendor's name, about, images.
