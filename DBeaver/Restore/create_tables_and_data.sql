drop table Persons;
drop table Persons2;
drop table RegistrationList;
drop table RegistrationList2;

create table Persons
    (Person_ID  integer,
    "Group"       text NOT NULL,
    Last_Name   text NOT NULL,
    First_Name  text NOT NULL,
    Email       text NOT NULL,
    "Unique_Key"    text NOT NULL,
    Advisor     integer NOT NULL,
    primary key (Person_ID),
    foreign key (Advisor) references RegistrationList (Person_ID)
    );
   
   create table Persons2
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
    (Professor_ID   integer,
    Date_Available  text NOT NULL,
    Time            text NOT NULL,
    Student_ID      integer,
    "Group"           text NOT NULL,
    primary key (Professor_ID, Date_Available, Time),
    foreign key (Professor_ID) references Persons(Person_ID),
    foreign key (Student_ID) references Persons(Person_ID)
    );
   
   create table RegistrationList2
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
insert into Persons values (1, 'Professor', 'Matocha', 'Jeff', 'matochaj@obu.edu', 'Unique_Key_1', 0);

insert into Persons values (2, 'Senior', 'Short', 'Thomas', 'sho74451@obu.edu', 'Unique_Key_2', 1);

insert into Persons values (3, 'Senior', 'Terry', 'Micah', 'ter74542@obu.edu', 'Unique_Key_3', 1);

insert into Persons values (4, 'Senior', 'Garcia', 'Kristopher', 'gar76751@obu.edu', 'Unique_Key_4', 1);

insert into Persons values (5, 'Senior', 'Spraggins', 'Samuel', 'spr75664@obu.edu', 'Unique_Key_5', 1);

insert into Persons values (6, 'Senior', 'Bostian', 'Corbin', 'bos67070@obu.edu', 'Unique_Key_6', 1);

insert into Persons values (7, 'Junior', 'Marine', 'Olivia', 'mar77947@obu.edu', 'Unique_Key_7', 1);

insert into Persons values (8, 'Freshman', 'Esho', 'Samuel', 'esh82048@obu.edu', 'Unique_Key_8', 10);

insert into Persons values (9, 'Sophomore', 'Ernest', 'Noah', 'ern79879@obu.edu', 'Unique_Key_9', 1);

insert into Persons values (10, 'Professor', 'Sykes', 'Jeff', 'sykesj@obu.edu', 'ABC123', 0);

-- Add to the Persons2 table.
insert into Persons2 values ('Professor', 'Matocha', 'Jeff', 'matochaj@obu.edu', 'ABC345', 'unassigned');

insert into Persons2 values ('Senior', 'Short', 'Thomas', 'sho74451@obu.edu', 'Unique_Key_2', 'ABC345');

insert into Persons2 values ('Senior', 'Terry', 'Micah', 'ter74542@obu.edu', 'Unique_Key_3', 'ABC345');

insert into Persons2 values ('Senior', 'Garcia', 'Kristopher', 'gar76751@obu.edu', 'Unique_Key_4', 'ABC345');

insert into Persons2 values ('Senior', 'Spraggins', 'Samuel', 'spr75664@obu.edu', 'Unique_Key_5', 'ABC345');

insert into Persons2 values ('Senior', 'Bostian', 'Corbin', 'bos67070@obu.edu', 'Unique_Key_6', 'ABC345');

insert into Persons2 values ('Junior', 'Marine', 'Olivia', 'mar77947@obu.edu', 'Unique_Key_7', 'ABC345');

insert into Persons2 values ('Freshman', 'Esho', 'Samuel', 'esh82048@obu.edu', 'Unique_Key_8', 'ABC123');

insert into Persons2 values ('Sophomore', 'Ernest', 'Noah', 'ern79879@obu.edu', 'Unique_Key_9', 'ABC345');

insert into Persons2 values ('Professor', 'Sykes', 'Jeff', 'sykesj@obu.edu', 'ABC123', 'unassigned');

-- Add to the RegistrationList table.
insert into RegistrationList values (1, '2024-11-04', '0800', 2, 'Senior');

insert into RegistrationList values (1, '2024-11-04', '1030', 3, 'Senior');

insert into RegistrationList values (1, '2024-11-05', '1200', 4, 'Senior');

insert into RegistrationList values (1, '2024-11-05', '0930', 5, 'Senior');

insert into RegistrationList values (1, '2024-11-07', '1500', 7, 'Junior');

insert into RegistrationList values (1, '2024-11-06', '0800', 6, 'Senior');

insert into RegistrationList values (1, '2024-11-06', '0830', 9, 'Sophomore');

insert into RegistrationList values (10, '2024-11-04', '1300', 8, 'Freshman');

-- Senior slots.
insert into RegistrationList values (1, '2024-11-04', '0830', 0, 'Senior');

insert into RegistrationList values (1, '2024-11-05', '0800', 0, 'Senior');

insert into RegistrationList values (1, '2024-11-04', '0900', 0, 'Senior');

-- Add to the RegistrationList2 table.
insert into RegistrationList2 values ('ABC345', '2024-11-04', '0800', 'Unique_Key_2', 'Senior');

insert into RegistrationList2 values ('ABC345', '2024-11-04', '1030', 'Unique_Key_3', 'Senior');

insert into RegistrationList2 values ('ABC345', '2024-11-05', '1200', 'Unique_Key_4', 'Senior');

insert into RegistrationList2 values ('ABC345', '2024-11-05', '0930', 'Unique_Key_5', 'Senior');

insert into RegistrationList2 values ('ABC345', '2024-11-07', '1500', 'Unique_Key_7', 'Junior');

insert into RegistrationList2 values ('ABC345', '2024-11-06', '0800', 'Unique_Key_6', 'Senior');

insert into RegistrationList2 values ('ABC345', '2024-11-06', '0830', 'Unique_Key_9', 'Sophomore');

insert into RegistrationList2 values ('ABC123', '2024-11-04', '1300', 'Unique_Key_8', 'Freshman');

-- Senior slots.
insert into RegistrationList2 values ('ABC123', '2024-11-04', '0830', 'available', 'Senior');

insert into RegistrationList2 values ('ABC123', '2024-11-05', '0800', 'available', 'Senior');

insert into RegistrationList2 values ('ABC123', '2024-11-04', '0900', 'unavailable', 'Senior');

-- Junior slots
--insert into RegistrationList values (1, '2024-11-06', '0830', 0, 'Junior');

--insert into RegistrationList values (1, '2024-11-06', '0800', 0, 'Junior');