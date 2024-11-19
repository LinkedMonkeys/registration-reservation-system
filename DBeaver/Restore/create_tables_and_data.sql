drop table Persons;
drop table RegistrationList;

create table Persons
    (Person_ID  integer,
    "Group"       text NOT NULL,
    Last_Name   text NOT NULL,
    First_Name  text NOT NULL,
    Email       text NOT NULL,
    "Key/URL_Specific"    text NOT NULL,
    Advisor     integer,
    primary key (Person_ID),
    foreign key (Advisor) references RegistrationList (Person_ID)
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

-- Junior slots
insert into RegistrationList values (1, '2024-11-06', '0830', 0, 'Junior');

insert into RegistrationList values (1, '2024-11-06', '0800', 0, 'Junior');