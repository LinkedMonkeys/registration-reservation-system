drop table Persons;
drop table RegistrationList;
   
   create table Persons
    ("Group"       text NOT NULL,
    Last_Name   text NOT NULL,
    First_Name  text NOT NULL,
    Email       text NOT NULL,
    Unique_Key    text NOT NULL,
    Advisor     text NOT NULL,
    primary key (Unique_Key),
    foreign key (Advisor) references RegistrationList (Professor_ID)
    );
   
   create table RegistrationList
    (Professor_ID   text NOT NULL,
    Date_Available  text NOT NULL,
    Time            text NOT NULL,
    Student_ID      text NOT NULL,
    "Group"           text NOT NULL,
    primary key (Professor_ID, Date_Available, Time),
    foreign key (Professor_ID) references Persons2(Unique_Key),
    foreign key (Student_ID) references Persons2(Unique_Key),
    foreign key (Professor_ID) references Persons2(Advisor)
    );

-- Add to the Persons table.
   
insert into Persons values ('', 'Available', '', '', 'Available_Key', '');

insert into Persons values ('', 'Not Available', '', '', 'Not_Available_Key', '');

insert into Persons values ('Professor', 'Matocha', 'Jeff', 'matochaj@obu.edu', 'ABC345', 'unassigned');

insert into Persons values ('Senior', 'Short', 'Thomas', 'sho74451@obu.edu', 'Unique_Key_2', 'ABC345');

insert into Persons values ('Senior', 'Terry', 'Micah', 'ter74542@obu.edu', 'Unique_Key_3', 'ABC345');

insert into Persons values ('Senior', 'Garcia', 'Kristopher', 'gar76751@obu.edu', 'Unique_Key_4', 'ABC345');

insert into Persons values ('Senior', 'Spraggins', 'Samuel', 'spr75664@obu.edu', 'Unique_Key_5', 'ABC345');

insert into Persons values ('Senior', 'Bostian', 'Corbin', 'bos67070@obu.edu', 'Unique_Key_6', 'ABC345');

insert into Persons values ('Junior', 'Marine', 'Olivia', 'mar77947@obu.edu', 'Unique_Key_7', 'ABC345');

insert into Persons values ('Freshman', 'Esho', 'Samuel', 'esh82048@obu.edu', 'Unique_Key_8', 'ABC123');

insert into Persons values ('Sophomore', 'Ernest', 'Noah', 'ern79879@obu.edu', 'Unique_Key_9', 'ABC345');

insert into Persons values ('Professor', 'Sykes', 'Jeff', 'sykesj@obu.edu', 'ABC123', 'unassigned');

-- Add to the RegistrationList table.

insert into RegistrationList values ('ABC345', '2024-11-08', '1000', 'Available_Key', 'Freshman');

insert into RegistrationList values ('ABC345', '2024-11-08', '1100', 'Not_Available_Key', 'Freshman');

insert into RegistrationList values ('ABC345', '2024-11-04', '0800', 'Unique_Key_2', 'Senior');

insert into RegistrationList values ('ABC345', '2024-11-04', '1030', 'Unique_Key_3', 'Senior');

insert into RegistrationList values ('ABC345', '2024-11-05', '1200', 'Unique_Key_4', 'Senior');

insert into RegistrationList values ('ABC345', '2024-11-05', '0930', 'Unique_Key_5', 'Senior');

insert into RegistrationList values ('ABC345', '2024-11-07', '1500', 'Unique_Key_7', 'Junior');

insert into RegistrationList values ('ABC345', '2024-11-06', '0800', 'Unique_Key_6', 'Senior');

insert into RegistrationList values ('ABC345', '2024-11-06', '0830', 'Unique_Key_9', 'Sophomore');

insert into RegistrationList values ('ABC123', '2024-11-04', '1300', 'Unique_Key_8', 'Freshman');